// utils/cryptoUtils.ts

import crypto from "crypto";

/**
 * Hashes a given token using SHA-256.
 * @param token - The token to hash.
 * @returns The hashed token as a hexadecimal string.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generates a secure passcode.
 * @returns A 6-character uppercase hexadecimal passcode.
 */
export const generatePasscode = (): string => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};
