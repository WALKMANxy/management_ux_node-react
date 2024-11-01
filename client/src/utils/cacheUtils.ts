// src/utils/cacheUtils.ts
import { Promo, Visit } from "../models/dataModels";
import { serverClient, serverMovement } from "../models/dataSetTypes";
import { Admin, Agent } from "../models/entityModels";
import { appCache, CacheEntry, FileCacheEntry } from "../services/cache";
import { showToast } from "../services/toastMessage";
import {
  decryptData,
  deriveKeyFromAuthState,
  encryptData,
  keyCache,
} from "./cryptoUtils";

const FILE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

const MAX_CACHE_SIZE = 100 * 1024 * 1024;

const CACHE_DURATIONS: Record<string, number> = {
  movements: 24 * 60 * 60 * 1000,
  clients: 24 * 60 * 60 * 1000,
  agents: 24 * 60 * 60 * 1000,
  admins: 24 * 60 * 60 * 1000,
  visits: 2 * 60 * 60 * 1000,
  promos: 2 * 60 * 60 * 1000,
};

type StoreData = {
  movements: serverMovement[];
  clients: serverClient[];
  agents: Agent[];
  admins: Admin[];
  visits: Visit[];
  promos: Promo[];
};

export type StoreName = keyof StoreData;

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
  // const startTime = Date.now();
  if (!encryptionKey) {
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
    const latestEntry = await appCache[storeName]
      .orderBy("timestamp")
      .reverse()
      .first();
    if (!latestEntry) return null;
    const currentTime = Date.now();
    if (currentTime - latestEntry.timestamp > CACHE_DURATIONS[storeName]) {
      await appCache[storeName].clear();
      return null;
    }
    let decryptedData = await decryptData(latestEntry.data, encryptionKey);
    const parsedData = JSON.parse(decryptedData) as T;
    decryptedData = "";
    return parsedData;
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
    await clearAllEncryptedCaches();
    showToast.error(
      "An error occurred while accessing cached data. All cached data has been cleared."
    );

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
    await appCache[storeName].add(entry);
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
      throw error;
    } finally {
      keyInitializationPromise = null;
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
      await keyInitializationPromise;
    } else if (params) {
      await initializeUserEncryption(params);
    } else {
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

export const clearAllEncryptedCaches = async (): Promise<void> => {
  const encryptedStores: StoreName[] = [
    "movements",
    "clients",
    "agents",
    "admins",
    "visits",
    "promos",
  ];
  try {
    await Promise.all(encryptedStores.map((store) => appCache[store].clear()));
    console.warn(
      "All encrypted caches have been cleared due to a decryption error."
    );
    keyCache.clear();
  } catch (error) {
    console.error("Error clearing all encrypted caches:", error);
    showToast.error("Failed to clear encrypted caches.");
  }
};

export const getCachedFile = async (
  fileName: string
): Promise<FileCacheEntry | null> => {
  try {
    const fileEntry = await appCache.files.get({ fileName });

    if (!fileEntry) return null;

    const currentTime = Date.now();
    if (currentTime - fileEntry.timestamp > FILE_CACHE_DURATION) {
      await appCache.files.where({ fileName }).delete();
      return null;
    }
    const objectUrl = URL.createObjectURL(fileEntry.blob);
    return { ...fileEntry, objectUrl };
  } catch (error) {
    console.error(`Error retrieving cached file (${fileName}):`, error);
    return null;
  }
};

export const cacheFile = async (
  fileName: string,
  blob: Blob
): Promise<string> => {
  try {
    const fileEntry: FileCacheEntry = {
      fileName,
      blob,
      objectUrl: "",
      timestamp: Date.now(),
    };
    await appCache.files.put(fileEntry);

    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  } catch (error) {
    console.error(`Error caching file (${fileName}):`, error);
    throw error;
  }
};


export const clearAllCachedFiles = async (): Promise<void> => {
  try {
    const allFiles = await appCache.files.toArray();
    allFiles.forEach((file) => URL.revokeObjectURL(file.objectUrl));
    await appCache.files.clear();
  } catch (error) {
    console.error("Error clearing cached files:", error);
    showToast.error("Failed to clear cached files.");
  }
};


export const removeCachedFile = async (fileName: string): Promise<void> => {
  try {
    const fileEntry = await appCache.files.get({ fileName });
    if (fileEntry) {
      URL.revokeObjectURL(fileEntry.objectUrl);
      await appCache.files.where({ fileName }).delete();
    }
  } catch (error) {
    console.error(`Error removing cached file (${fileName}):`, error);
    showToast.error(`Failed to remove cached file: ${fileName}`);
  }
};

export const cleanupStaleFiles = async (): Promise<void> => {
  try {
    const currentTime = Date.now();
    const staleFiles = await appCache.files
      .filter((file) => currentTime - file.timestamp > FILE_CACHE_DURATION)
      .toArray();

    staleFiles.forEach((file) => {
      URL.revokeObjectURL(file.objectUrl);
    });

    await appCache.files.bulkDelete(staleFiles.map((file) => file.fileName));
  } catch (error) {
    console.error("Error during stale file cleanup:", error);
    showToast.error("Failed to clean up stale files.");
  }
};

export const enforceCacheSizeLimit = async (): Promise<void> => {
  try {
    // Step 1: Calculate the total cache size without sorting or fetching all files
    let totalSize = 0;
    await appCache.files.each((file) => {
      totalSize += file.blob.size;
    });

    // Step 2: If the total size is below the limit, we can return early
    if (totalSize <= MAX_CACHE_SIZE) {
      return; // Cache size is within limit, no need for cleanup
    }

    // Step 3: If cache exceeds the limit, fetch files and delete the oldest half
    const allFiles = await appCache.files.orderBy("timestamp").toArray();
    const numFilesToDelete = Math.floor(allFiles.length / 2); // Delete half of the oldest files

    // Step 4: Delete the oldest files until the cache size is within the limit
    for (let i = 0; i < numFilesToDelete; i++) {
      const file = allFiles[i];
      await removeCachedFile(file.fileName);
      totalSize -= file.blob.size;
      // Break early if the total size is reduced below the limit
      if (totalSize <= MAX_CACHE_SIZE) break;
    }

  /*   console.log(
      `Deleted ${numFilesToDelete} files to enforce cache size limit.`
    ); */
  } catch (error) {
    console.error("Error enforcing cache size limit:", error);
  }
};
