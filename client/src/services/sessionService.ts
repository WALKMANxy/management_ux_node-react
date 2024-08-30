import axios from "axios";
import store from "../app/store";
import { getApiUrl } from "../config/config";
import { handleLogout } from "../features/auth/authSlice";
import { webSocketService } from "./webSocketService"; // Import the WebSocket service

const apiUrl = getApiUrl();

if (!apiUrl) {
  console.error("Api URL is not defined inside sessionService.ts.");
}

export const refreshSession = async (): Promise<boolean> => {
  try {
    const userAgent = navigator.userAgent;
    const response = await axios.post(
      `${apiUrl}/auth/refresh-session`, // Use the full URL with the base path
      { userAgent }, // Send userAgent
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
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
