// src/utils/cacheUtils.ts

import { Agent } from "http";
import { Promo, Visit } from "../models/dataModels";
import { serverClient, serverMovement } from "../models/dataSetTypes";
import { Admin } from "../models/entityModels";
import { appCache, CacheEntry } from "../services/cache";
import { showToast } from "../services/toastMessage";
import {
  decryptData,
  deriveKeyFromAuthState,
  encryptData,
} from "./cryptoUtils";

// Define cache durations in milliseconds
const CACHE_DURATIONS: Record<string, number> = {
  movements: 24 * 60 * 60 * 1000, // 24 hours
  clients: 24 * 60 * 60 * 1000,
  agents: 24 * 60 * 60 * 1000,
  admins: 24 * 60 * 60 * 1000,
  visits: 2 * 60 * 60 * 1000, // 2 hours
  promos: 2 * 60 * 60 * 1000,
};

// Define the mapping from store names to their data types
type StoreData = {
  movements: serverMovement[];
  clients: serverClient[];
  agents: Agent[];
  admins: Admin[];
  visits: Visit[];
  promos: Promo[];
};

export type StoreName = keyof StoreData;

// Manage the encryption key within cacheUtils.ts
let encryptionKey: CryptoKey | null = null;
let keyInitializationPromise: Promise<void> | null = null;

export const initializeEncryption = (key: CryptoKey | null) => {
  encryptionKey = key;
};

export const clearEncryption = () => {
  encryptionKey = null;
};

export const getCachedData = async <T>(
  storeName: StoreName
): Promise<T | null> => {
  /*   const startTime = Date.now();
   */ if (!encryptionKey) {
    if (keyInitializationPromise) {
      await keyInitializationPromise;
    } else {
      console.error(
        "Encryption key not initialized and no initialization in progress."
      );
      return null;
    }
  }

  if (!encryptionKey) {
    console.error("Encryption key not initialized after awaiting.");
    throw new Error("Encryption key not initialized.");
  }

  try {
    // Fetch the latest entry directly using Dexie's querying capabilities
    const latestEntry = await appCache[storeName]
      .orderBy("timestamp")
      .reverse()
      .first();

    if (!latestEntry) return null;

    const currentTime = Date.now();

    if (currentTime - latestEntry.timestamp > CACHE_DURATIONS[storeName]) {
      // Cache is stale
      await appCache[storeName].clear();
      return null;
    }

    const decryptedData = await decryptData(latestEntry.data, encryptionKey);
    return JSON.parse(decryptedData) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "OperationError") {
      console.error(
        `OperationError occurred while decrypting data from ${storeName}:`,
        error.message
      );
    } else if (error instanceof SyntaxError) {
      console.error(
        `SyntaxError: Could not parse decrypted data from ${storeName}. The decrypted data might be corrupted.`,
        error.message
      );
    } else if (error instanceof Error) {
      console.error(
        `General error in getCachedData(${storeName}):`,
        error.message,
        error.stack
      );
    } else {
      console.error(`Unknown error in getCachedData(${storeName}):`, error);
    }

    return null;
  }
};

export const setCachedData = async <T>(
  storeName: StoreName,
  data: T
): Promise<void> => {
  if (!encryptionKey) {
    if (keyInitializationPromise) {
      await keyInitializationPromise;
    } else {
      console.error(
        "Encryption key not initialized and no initialization in progress."
      );
      return;
    }
  }

  if (!encryptionKey) {
    console.error("Encryption key not initialized after awaiting.");
    return;
  }

  try {
    const jsonData = JSON.stringify(data);
    const encryptedData = await encryptData(jsonData, encryptionKey);

    const entry: CacheEntry = {
      data: encryptedData,
      timestamp: Date.now(),
    };
    await appCache[storeName].add(entry); // Ensure 'id' is optional in CacheEntry
  } catch (error) {
    console.error(`Error encrypting data for ${storeName}:`, error);
    showToast.error(`Failed to cache data for ${storeName}.`);
  }
};

export const clearCachedData = async (storeName: StoreName): Promise<void> => {
  try {
    await appCache[storeName].clear();
  } catch (error) {
    console.error(`Error clearing cache for ${storeName}:`, error);
  }
};

export const initializeUserEncryption = async (params: {
  userId: string;
  timeMS: string;
}): Promise<void> => {
  if (keyInitializationPromise) {
    // If initialization is already in progress, wait for it
    return keyInitializationPromise;
  }

  const { userId, timeMS } = params;

  keyInitializationPromise = (async () => {
    try {
      const key = await deriveKeyFromAuthState(userId, timeMS);
      initializeEncryption(key);
    } catch (error) {
      console.error("Encryption initialization failed:", error);
      initializeEncryption(null);
      throw error; // Re-throw to allow upstream handling
    } finally {
      keyInitializationPromise = null; // Reset the promise after initialization
    }
  })();

  return keyInitializationPromise;
};
export const ensureEncryptionInitialized = async (params?: {
  userId: string;
  userAgent: string;
  timeMS: string;
}): Promise<void> => {
  if (!encryptionKey) {
    if (keyInitializationPromise) {
      // If initialization is already in progress, wait for it
      await keyInitializationPromise;
    } else if (params) {
      // If no initialization in progress, start initializing
      await initializeUserEncryption(params);
    } else {
      // Cannot initialize without params
      throw new Error(
        "Encryption key not initialized and no initialization in progress."
      );
    }
  }

  if (!encryptionKey) {
    throw new Error("Encryption key not initialized after awaiting.");
  }
};

export const getCachedDataSafe = async <T>(
  storeName: StoreName
): Promise<T | null> => {
  await ensureEncryptionInitialized();
  return getCachedData<T>(storeName);
};

export const setCachedDataSafe = async <T>(
  storeName: StoreName,
  data: T
): Promise<void> => {
  await ensureEncryptionInitialized();
  return setCachedData<T>(storeName, data);
};
