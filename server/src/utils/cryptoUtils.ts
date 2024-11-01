// utils/cryptoUtils.ts
import crypto from "crypto";

export const generatePasscode = (): string => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};
