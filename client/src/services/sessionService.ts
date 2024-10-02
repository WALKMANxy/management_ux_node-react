// src/services/sessionService.ts
import store from "../app/store";
import { handleLogout } from "../features/auth/authSlice";
import { authApiCall, AuthApiResponse } from "../utils/apiUtils";
import { webSocketService } from "./webSocketService";

export const refreshSession = async (): Promise<boolean> => {
  try {
    const response = await authApiCall<AuthApiResponse>(
      "auth/refresh-session",
      "POST",
      { userAgent: navigator.userAgent }
    );

    if (response.statusCode !== 200) {
      throw new Error("Session refresh failed");
    }

    // Ensure WebSocket is not already connected
    if (!webSocketService.isConnected()) { // Implement `isConnected` in your WebSocket service
      webSocketService.connect();
    }

    return true;
  } catch (error) {
    console.error("Session refresh error:", error);

    // Logout the user and clear auth state on failure
    store.dispatch(handleLogout());
    localStorage.removeItem("authState");
    sessionStorage.clear();

    return false;
  }
};
