// src/utils/cryptoUtils.ts

import {
  decode as base64Decode,
  encode as base64Encode,
} from "base64-arraybuffer";
import { t } from "i18next";

// Module-level instances
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Cache for derived keys
const keyCache = new Map<string, CryptoKey>();

const STORAGE_KEY = "app_unique_identifier";

export const getUniqueIdentifier = (): string => {
  try {
    let uniqueId = localStorage.getItem(STORAGE_KEY);

    if (!uniqueId) {
      // Use crypto.randomUUID() if available, otherwise fallback to a custom UUID generator
      uniqueId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
      localStorage.setItem(STORAGE_KEY, uniqueId);
    }

    return uniqueId;
  } catch (error) {
    console.warn(
      "LocalStorage or crypto.randomUUID is not available, generating a temporary UUID."
    );
    console.error(error);

    // If localStorage fails or crypto.randomUUID is unavailable, generate a UUID
    return crypto.randomUUID ? crypto.randomUUID() : generateUUID();
  }
};

// Fallback function to generate a UUID
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const deriveKeyFromAuthState = async (
  userId: string,
  salt: string
): Promise<CryptoKey> => {
  const uniqueId = getUniqueIdentifier();
  const cacheKey = `${userId}-${uniqueId}-${salt}`;
  if (keyCache.has(cacheKey)) {
    return keyCache.get(cacheKey)!;
  }

  try {
    const keyMaterial = `${userId}-${uniqueId}`;
    const keyMaterialBuffer = encoder.encode(keyMaterial);
    const saltBuffer = encoder.encode(salt);

    const importedKey = await crypto.subtle.importKey(
      "raw",
      keyMaterialBuffer,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: 50000, // Adjusted iterations
        hash: "SHA-256",
      },
      importedKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    keyCache.set(cacheKey, derivedKey);
    return derivedKey;
  } catch (error) {
    console.error("Key derivation failed:", error);
    throw new Error(t("encryption.keyDerivationFailed"));
  }
};

export const encryptData = async (
  data: string,
  key: CryptoKey
): Promise<string> => {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(data)
    );

    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.byteLength);

    return base64Encode(combined);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error(t("encryption.encryptionFailed"));
  }
};

export const decryptData = async (
  data: string,
  key: CryptoKey
): Promise<string> => {
  if (typeof data !== "string") {
    throw new TypeError(t("errors.invalidDataFormat"));
  }

  try {
    const combined = new Uint8Array(base64Decode(data));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error(t("errors.decryptionFailed"));
  }
};
