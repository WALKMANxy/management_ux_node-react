import store from "../app/store";
import { handleLogout } from "../features/auth/authSlice";
import { authApiCall, AuthApiResponse } from "../utils/apiUtils";
import { webSocketService } from "./webSocketService"; // Import the WebSocket service

export const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

if (!baseUrl) {
  console.error("Api URL is not defined inside sessionService.ts.");
}

export const refreshSession = async (): Promise<boolean> => {
  try {
    const userAgent = navigator.userAgent;
    // Use authApiCall for the refresh-session POST request
    const response = await authApiCall<AuthApiResponse>(
      "auth/refresh-session",
      "POST",
      { userAgent }
    );

    if (response.statusCode === 200) {
      // Session refreshed successfully, establish WebSocket connection
      webSocketService.connect(); // Connect WebSocket after session refresh
      return true;
    } else {
      throw new Error("Session refresh failed");
    }
  } catch (error) {
    console.error("Session refresh error:", error);

    // Logout the user and clear auth state on failure
    store.dispatch(handleLogout());
    localStorage.removeItem("authState");
    sessionStorage.clear();

    return false;
  }
};
