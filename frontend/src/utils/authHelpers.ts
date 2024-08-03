// utils/authHelpers.ts

import Cookies from "js-cookie";
import {jwtDecode as decode} from "jwt-decode"; // Import jwtDecode as the default export

// Custom Error Types
class TokenNotFoundError extends Error {
  constructor() {
    super("JWT token not found in cookies.");
    this.name = "TokenNotFoundError";
  }
}

class TokenDecodeError extends Error {
  constructor(message: string) {
    super(`Failed to decode JWT token: ${message}`);
    this.name = "TokenDecodeError";
  }
}

// Logger utility function
const logError = (error: Error) => {
  console.error(`[${new Date().toISOString()}] ${error.name}: ${error.message}`);
};

export const extractUserIdFromCookie = (): string | null => {
  const token = Cookies.get("token");
  if (!token) {
    const error = new TokenNotFoundError();
    logError(error);
    return null;
  }

  try {
    const decoded: { id: string } = decode(token);
    return decoded.id;
  } catch (error) {
    const decodeError = new TokenDecodeError((error as Error).message);
    logError(decodeError);
    return null;
  }
};

export const clearAuthData = () => {
  try {
    Cookies.remove("token");
    sessionStorage.clear();
    console.log(`[${new Date().toISOString()}] Auth data cleared.`);
  } catch (error) {
    const clearError = new Error("Failed to clear auth data.");
    logError(clearError);
  }
};
