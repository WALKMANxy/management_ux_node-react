// utils/cryptoUtils.ts

import crypto from "crypto";


/**
 * Generates a secure passcode.
 * @returns A 6-character uppercase hexadecimal passcode.
 */
export const generatePasscode = (): string => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};
