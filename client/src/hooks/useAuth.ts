import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import store from "../app/store";

import { setCurrentUser } from "../features/users/userSlice";
import { User } from "../models/entityModels";

import { useTranslation } from "react-i18next";
import { getTimeMs } from "../config/config";
import { loginUser, registerUser } from "../features/auth/api/auth";
import { handleLogin, handleLogout } from "../features/auth/authThunks";
import { getUserById } from "../features/users/api/users";
import { FetchUserRoleError } from "../services/errorHandling";
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
    console.log("Attempting to register with credentials:", { email });

    // Client-side validation for email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage("Invalid email address.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return; // Stop execution if validation fails
    }

    // Client-side validation for password
    if (password.length < 8) {
      setAlertMessage("Password must be at least 8 characters long.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setAlertMessage("Password must contain at least 1 uppercase letter.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    if (!/[a-z]/.test(password)) {
      setAlertMessage("Password must contain at least 1 lowercase letter.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    if (!/[0-9]/.test(password)) {
      setAlertMessage("Password must contain at least 1 number.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setAlertMessage("Password must contain at least 1 special character.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    try {
      const { statusCode, message } = await registerUser({
        email,
        password,
      });

      // Check if the login was unsuccessful
      if (statusCode !== 201) {
        console.warn(
          "Login failed with status code:",
          statusCode,
          "Message:",
          message
        );
        setAlertMessage(t("auth.loginFailed" + { message }));
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      console.log("Response from registerUser:", {
        statusCode,
      });

      setAlertMessage(t("auth.registrationSuccess")); // translation key
      setAlertSeverity(statusCode === 201 ? "success" : "error");
      setAlertOpen(true);
    } catch (error) {
      console.warn("Registration error:", (error as Error).message);

      setAlertMessage("Registration failed. Please try again.");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const initiateLogin = async (
    email: string,
    password: string,
    setAlertMessage: (message: string) => void,
    setAlertSeverity: (severity: "success" | "error" | "info") => void,
    setAlertOpen: (open: boolean) => void,
    onClose: () => void,
    keepMeSignedIn: boolean
  ) => {
    try {
      // Check if email or password is empty
      if (!email || !password) {
        setAlertMessage(t("auth.enterEmailAndPassword")); // Translated message for empty fields
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      // Attempt to log in the user
      const { id, message, statusCode, refreshToken } = await loginUser({
        email,
        password,
      });

      // Handle 401 Unauthorized response
      if (statusCode === 401) {
        setAlertMessage(t("auth.loginInconsistency")); // Translated message for 401 errors
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      // Check if the login was unsuccessful
      if (statusCode !== 200) {
        console.warn("Login failed with status code:", statusCode, "Message:", message);
        setAlertMessage(t("auth.loginFailed" + message));
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      // Proceed if the login was successful
      const userId = id;

      if (userId) {
        await initializeUserEncryption({
          userId,
          timeMS,
        });

        const result = await getUserById(userId);

        if (result) {
          const user = result as User;

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

          dispatch(setCurrentUser(user));

          if (keepMeSignedIn) {
            saveAuthState(store.getState().auth);
          }

          onClose();
        }
      } else {
        console.error("User ID not found in login response");
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
      } else if (error instanceof Error && error.message.includes("undefined")) {
        errorMessage = t("auth.serverUnreachable");
        setAlertMessage(errorMessage);
        setAlertSeverity(errorSeverity);
        setAlertOpen(true);
      } else if (error instanceof Error && error.message.includes("Forbidden")) {
        errorMessage = t("auth.accountEntityAssignmentPending"); // Translated message for "Forbidden" error
        setAlertMessage(errorMessage);
        setAlertSeverity("info");
        setAlertOpen(true);
      }

      setAlertMessage(errorMessage);
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
      setAlertMessage(t("auth.logoutSuccess"));
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (error: unknown) {
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
