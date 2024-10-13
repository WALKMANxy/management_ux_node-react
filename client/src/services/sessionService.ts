import axios from "axios";
import { baseUrl } from "../utils/apiUtils";
import { showToast } from "./toastMessage";
import { setAccessToken } from "./tokenService";
import { webSocketService } from "./webSocketService";

/**
 * Function to refresh the access token using the refresh token.
 */
export async function refreshAccessToken(): Promise<boolean> {
  // console.log("Entering refreshAccessToken function");

  let localAuthState;
  if (localStorage.getItem("authState")) {
    localAuthState = JSON.parse(localStorage.getItem("authState")!);
  } else if (sessionStorage.getItem("authState")) {
    localAuthState = JSON.parse(sessionStorage.getItem("authState")!);
  } else {
    console.error("No authState available in local or session storage");
    showToast.error("No authState available in local or session storage, logging out...");
    return false;
  }
  // console.log("Local auth state:", localAuthState);
  const refreshToken = localAuthState.refreshToken;
  // console.log("Refresh token:", refreshToken);

  const uniqueId = localStorage.getItem("app_unique_identifier");
  // console.log("Unique ID:", uniqueId);

  if (!refreshToken || !uniqueId) {
    console.error("No refresh token or uniqueId available");
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

    webSocketService.connect();
    return true;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return false;
  }
}
