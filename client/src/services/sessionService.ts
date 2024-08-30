import axios from "axios";
import store from "../app/store";
import { getApiUrl } from "../config/config";
import { handleLogin, handleLogout } from "../features/auth/authSlice";
import { saveAuthState } from "../utils/localStorage";

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
      const authState = store.getState().auth;

      if (authState.id && authState.userId) {
        store.dispatch(
          handleLogin({
            role: authState.role,
            id: authState.id,
            userId: authState.userId,
          })
        );
        saveAuthState(store.getState().auth);
        return true;
      } else {
        throw new Error("Missing user id or userId in auth state");
      }
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
