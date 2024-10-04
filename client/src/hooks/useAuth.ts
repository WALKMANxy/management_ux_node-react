import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import store from "../app/store";

import { handleLogin, handleLogout } from "../features/auth/authSlice";
import { setCurrentUser } from "../features/users/userSlice";
import { User } from "../models/entityModels";

import { useTranslation } from "react-i18next";
import { getTimeMs } from "../config/config";
import { loginUser, registerUser } from "../features/auth/api/auth";
import { getUserById } from "../features/users/api/users";
import {
  FetchUserRoleError,
  LoginError,
  RegistrationError,
} from "../services/errorHandling";
import { saveAuthState } from "../services/localStorage";
import { showToast } from "../services/toastMessage";
import { setAccessToken } from "../services/tokenService";
import { initializeUserEncryption } from "../utils/cacheUtils";
import { getUniqueIdentifier } from "../utils/cryptoUtils";

const timeMS = getTimeMs(); // Ensure this is set in your .env file

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const initiateRegister = async (
    email: string,
    password: string,
    setAlertMessage: (message: string) => void,
    setAlertSeverity: (severity: "success" | "error") => void,
    setAlertOpen: (open: boolean) => void
  ) => {
    try {
      const { message, statusCode } = await registerUser({
        email,
        password,
      });
      setAlertMessage(t("auth.registrationSuccess" + message)); // translation key
      setAlertSeverity(statusCode === 201 ? "success" : "error");
      setAlertOpen(true);
    } catch (error) {
      const registrationError = new RegistrationError((error as Error).message);
      setAlertMessage(t("auth.registrationFailed" + registrationError.message)); // translation key
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const initiateLogin = async (
    email: string,
    password: string,
    setAlertMessage: (message: string) => void,
    setAlertSeverity: (severity: "success" | "error" | "info") => void, // Added "info" severity
    setAlertOpen: (open: boolean) => void,
    onClose: () => void,
    keepMeSignedIn: boolean
  ) => {
    try {
      console.log("Attempting to log in with credentials:", { email });

      // Attempt to log in the user
      const { id, message, statusCode, refreshToken } = await loginUser({
        email,
        password,
      });

      console.log("Response from loginUser:", {
        id,
        message,
        statusCode,
        refreshToken,
      });

      // Check if the login was unsuccessful
      if (statusCode !== 200) {
        console.warn(
          "Login failed with status code:",
          statusCode,
          "Message:",
          message
        );
        setAlertMessage(t("auth.loginFailed" + message));
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      // Proceed if the login was successful
      const userId = id;

      if (userId) {
        console.log("User ID retrieved from login response:", userId);

        // Derive the encryption key using userId, userAgent, and salt
        await initializeUserEncryption({
          userId,
          timeMS,
          // Check if the
        });

        console.log("Encryption initialized for user:", userId);

        // Dispatch an action to get the user role by ID
        const result = await getUserById(userId);
        console.log("Response from getUserById:", result);

        if (result) {
          const user = result as User;

          console.log("User role retrieved:", user.role);

          if (!user.role) {
            setAlertMessage(t("auth.roleNotAssigned" + message));
            setAlertSeverity("info");
            setAlertOpen(true);
            return;
          }

          if (user.role === "guest") {
            setAlertMessage(t("auth.accountVerificationPending" + message));
            setAlertSeverity("error");
            setAlertOpen(true);
            return;
          }

          await dispatch(
            handleLogin({
              role: user.role,
              id: user.entityCode,
              userId: user._id,
              refreshToken,
            })
          );

          console.log("Login dispatched successfully.");

          // Set the current user in the userSlice for consistent state management
          dispatch(setCurrentUser(user));

          // Save auth state if 'Keep me signed in' is selected
          if (keepMeSignedIn) {
            saveAuthState(store.getState().auth);
            console.log("Auth state saved in local storage");
          }

          onClose();
        }
      } else {
        console.error("User ID not found in login response");
        showToast.error(t("auth.userNotFound"));
        setAlertMessage(t("auth.userNotFound"));
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error during initiateLogin:", error);
      let errorMessage = t("auth.errorDuringLogin");
      let errorSeverity: "error" | "info" = "error";

      if (error instanceof FetchUserRoleError) {
        errorMessage = t("auth.roleNotAssigned");
        errorSeverity = "info";
      } else if (
        error instanceof Error &&
        error.message.includes("undefined")
      ) {
        errorMessage = t("auth.serverUnreachable");
      }

      showToast.error(errorMessage);
      const loginError = new LoginError(errorMessage);
      setAlertMessage(loginError.message);
      setAlertSeverity(errorSeverity);
      setAlertOpen(true);
    }
  };

  const initiateLogout = (
    setAlertMessage: (message: string) => void,
    setAlertSeverity: (severity: "success" | "error") => void,
    setAlertOpen: (open: boolean) => void
  ) => {
    try {
      dispatch(handleLogout());
      showToast.success(t("auth.logoutSuccess")); // Toast for successful logout
      setAlertMessage(t("auth.logoutSuccess"));
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (error: unknown) {
      showToast.error(t("auth.logoutFailed")); // Toast for logout failure
      if (error instanceof Error) {
        setAlertMessage(t("auth.logoutFailed"));
        setAlertSeverity("error");
        setAlertOpen(true);
      } else {
        setAlertMessage(t("auth.unexpectedError"));
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    }
  };

  const handleLoginWithGoogle = () => {
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("oauth_state", state);

    const uniqueId = getUniqueIdentifier(); // Fetch or generate the uniqueId for the device

    const googleAuthUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/oauth2/google?state=${state}&uniqueId=${uniqueId}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    window.open(
      googleAuthUrl,
      "GoogleLogin",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  useEffect(() => {
    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== import.meta.env.VITE_API_BASE_URL) {
        return;
      }

      const { status, state, user, refreshToken, accessToken } = event.data;
      const expectedState = sessionStorage.getItem("oauth_state");
      sessionStorage.removeItem("oauth_state");

      if (state !== expectedState) {
        showToast.error(t("auth.invalidStateParameter")); // Toast for invalid OAuth state
        return;
      }

      if (status === "success" && user) {
        showToast.success(t("auth.googleLoginSuccess")); // Toast for Google OAuth success
        // Derive the encryption key using Google ID and email
        // Derive the encryption key using userId, userAgent, and salt
        const userId = user._id; // Adjust based on your user model
        await initializeUserEncryption({
          userId,
          timeMS,
        });

        setAccessToken(accessToken);

        await dispatch(
          handleLogin({
            role: user.role,
            id: user.entityCode,
            userId: user._id,
            refreshToken,
          })
        );
      } else {
        showToast.error(t("auth.googleLoginFailed")); // Toast for Google OAuth failure
      }
    };

    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [dispatch, t]);

  return {
    initiateRegister,
    initiateLogin,
    initiateLogout,
    handleLoginWithGoogle,
  };
};
