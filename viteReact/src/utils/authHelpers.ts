// utils/authHelpers.ts

import Cookies from "js-cookie";

// Logger utility function
const logError = (error: Error) => {
  console.error(
    `[${new Date().toISOString()}] ${error.name}: ${error.message}`
  );
};

export const clearAuthData = () => {
  try {
    Cookies.remove("token");
    sessionStorage.clear();
    localStorage.clear();
    console.log(`[${new Date().toISOString()}] Auth data cleared.`);
  } catch (error) {
    const clearError = new Error("Failed to clear auth data.");
    logError(clearError);
  }
};
