// services/api/auth.ts

import axios from "axios";
import Cookies from "js-cookie";
import { getUserAgent } from "../../utils/deviceUtils";
import { authApiCall } from "./apiUtils";

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
  redirectUrl: string;
  id: string;
  message: string;
  statusCode: number;
}> => {
  const userAgent = getUserAgent();

  return authApiCall<{ redirectUrl: string; id: string }>(
    "auth/login",
    "POST",
    {
      ...credentials,
      userAgent,
    }
  );
};

// Specific function to request a password reset
export const requestPasswordReset = async (
  email: string
): Promise<{ message: string; statusCode: number }> => {
  return authApiCall<void>("auth/request-password-reset", "POST", { email });
};

// Specific function to reset password
export const resetPassword = async (
  token: string,
  passcode: string,
  newPassword: string
): Promise<{ message: string; statusCode: number }> => {
  const data = { passcode, newPassword };
  return authApiCall<void>(`auth/reset-password?token=${token}`, "POST", data);
};

// Function to initiate Google OAuth flow
export const initiateGoogleOAuth = () => {
  window.location.href = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${appUrl}/oauth2/callback&response_type=code&scope=email%20profile`;
};

// Function to link Google account to an existing user
export const linkGoogleAccount = async (code: string) => {
  try {
    const token = Cookies.get("token"); // Get the JWT token if user is logged in
    const response = await axios.get(`${baseUrl}/auth/link-google`, {
      params: { code },
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error linking Google account:", error);
    throw new Error("Failed to link Google account");
  }
};

// Handle the OAuth callback and retrieve the user's session
export const handleOAuthCallback = async (code: string) => {
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
