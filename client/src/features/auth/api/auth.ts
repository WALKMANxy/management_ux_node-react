// services/api/auth.ts

import axios from "axios";
import { setAccessToken } from "../../../services/tokenService";
import { authApiCall } from "../../../utils/apiUtils";
import { getUniqueIdentifier } from "../../../utils/cryptoUtils";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

// Specific function for registering a user
export const registerUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{ message: string; statusCode: number }> => {
  return authApiCall<void>("auth/register", "POST", credentials);
};

// Specific function for logging in a user
export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{
  id: string;
  message: string;
  statusCode: number;
  refreshToken: string;
}> => {
  const uniqueId = getUniqueIdentifier();
  console.log("Generated uniqueId for login:", uniqueId);

  try {
    // Make the login API call and pass the uniqueId
    const response = await authApiCall<{
      id: string;
      accessToken: string;
      refreshToken: string;
    }>("auth/login", "POST", {
      ...credentials,
      uniqueId,
    });

    console.log("Login API response:", response);

    // Validate tokens
    if (!response.accessToken || !response.refreshToken) {
      console.error("Access token or refresh token missing in login response");
      throw new Error("Login failed: Access token or Refresh token missing");
    }

    // Store the access token in memory
    setAccessToken(response.accessToken);
    console.log("Access token set successfully in memory");

    return {
      id: response.id,
      message: response.message,
      statusCode: response.statusCode,
      refreshToken: response.refreshToken,
    };
  } catch (error) {
    console.error("Error during login API call:", error);
    throw error;
  }
};


export const logoutUser = async (): Promise<void> => {
  // First check sessionStorage, then fallback to localStorage
  const localAuthState =
    JSON.parse(localStorage.getItem("authState")!) ||
    JSON.parse(sessionStorage.getItem("authState")!);
  if (!localAuthState) {
    throw new Error("No auth state found for logout.");
  }

  const refreshToken = localAuthState.refreshToken;

  const uniqueId = getUniqueIdentifier();

  if (!refreshToken) {
    throw new Error("No refresh token found for logout.");
  }

  try {
    await axios.post(
      `${baseUrl}/auth/logout`,
      {}, // No body required
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`, 
          "bypass-tunnel-reminder": "true",
          "Content-Type": "application/json",
          uniqueId: uniqueId,
        },
      }
    );
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("Logout failed");
  }
};

// Function to link Google account to an existing user
export const linkGoogleAccount = async (code: string) => {
  try {
    const response = await axios.post(
      `${baseUrl}/auth/link-google`,
      { code },
      {
        headers: {
          "bypass-tunnel-reminder": "true",
          "Content-Type": "application/json",
        },

        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error linking Google account:", error);
    throw new Error("Failed to link Google account");
  }
};

// API to request a password reset by sending the user's email
export const requestPasswordReset = async (email: string): Promise<void> => {
  return authApiCall<void>("auth/request-password-reset", "POST", { email });
};

// API to verify the reset code entered by the user
export const verifyResetCode = async (
  email: string,
  code: string
): Promise<void> => {
  return authApiCall<void>("auth/verify-reset-code", "POST", { email, code });
};

// API to update the user's password after successful code verification
export const updatePassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<void> => {
  return authApiCall<void>("auth/update-password", "POST", {
    email,
    code,
    newPassword,
  });
};
