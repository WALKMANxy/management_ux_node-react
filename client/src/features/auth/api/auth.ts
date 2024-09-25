// services/api/auth.ts

import axios from "axios";
import { authApiCall } from "../../../utils/apiUtils";
import { getUserAgent } from "../../../utils/deviceUtils";
import { generateRandomState } from "../../../utils/oatuhUtils";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const appUrl = import.meta.env.ITE_APP_URL || "";

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
}> => {
  const userAgent = getUserAgent();

  return authApiCall<{ id: string }>("auth/login", "POST", {
    ...credentials,
    userAgent,
  });
};

// Function to initiate Google OAuth flow
export const initiateGoogleOAuth = () => {
  const state = generateRandomState();
  sessionStorage.setItem("oauth_state", state);
  window.location.href = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${appUrl}/oauth2/callback&response_type=code&scope=email%20profile&state=${state}`;
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

// Handle the OAuth callback and retrieve the user's session
export const handleOAuthCallback = async (code: string, state: string) => {
  const expectedState = sessionStorage.getItem("oauth_state");
  sessionStorage.removeItem("oauth_state");

  if (state !== expectedState) {
    throw new Error("Invalid OAuth state");
  }

  const userAgent = navigator.userAgent;

  try {
    const response = await axios.post(
      `${appUrl}/auth/oauth2/callback`,
      {
        code,
        userAgent,
      },
      {
        withCredentials: true, // To ensure the session cookie is set
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    throw new Error("Failed to process OAuth callback");
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
