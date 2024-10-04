import axios from "axios";
import { baseUrl } from "../utils/apiUtils";
import { showToast } from "./toastMessage";
import { setAccessToken } from "./tokenService";

/**
 * Function to refresh the access token using the refresh token.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const localAuthState =
    JSON.parse(localStorage.getItem("authState")!) ||
    JSON.parse(sessionStorage.getItem("authState")!);

  const refreshToken = localAuthState.refreshToken;
  const uniqueId = localStorage.getItem("app_unique_identifier");

  if (!refreshToken || !uniqueId) {
    console.error("No refresh token or uniqueId available");
    showToast.error("No refresh token or uniqueId available, logging out...");
    return false;
  }

  try {
    // Create a separate Axios instance to avoid interceptor loops
    const response = await axios.post(
      `${baseUrl}/auth/refresh-session`,
      { refreshToken, uniqueId },
      {
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
        },
      }
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;

    // Update tokens
    setAccessToken(newAccessToken);
    localStorage.setItem(
      "authState",
      JSON.stringify({ ...localAuthState, refreshToken: newRefreshToken })
    );
    sessionStorage.setItem(
      "authState",
      JSON.stringify({ ...localAuthState, refreshToken: newRefreshToken })
    );
    return true;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    showToast.error("No refresh token or uniqueId available, logging out...");
    return false;
  }
}
