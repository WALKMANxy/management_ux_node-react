import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import store from "../app/store";
import {
  authApi,
  useLoginUserMutation,
  useRegisterUserMutation,
} from "../features/auth/authQueries";
import { handleLogin, handleLogout } from "../features/auth/authSlice";
import { setCurrentUser } from "../features/users/userSlice";
import { User } from "../models/entityModels";

import { useTranslation } from "react-i18next";
import {
  FetchUserRoleError,
  LoginError,
  RegistrationError,
} from "../utils/errorHandling";
import { saveAuthState } from "../utils/localStorage";
import { showToast } from "../utils/toastMessage";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [registerUser] = useRegisterUserMutation();
  const [loginUser] = useLoginUserMutation();
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
      }).unwrap();
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
      // Attempt to log in the user
      const { id, message, statusCode } = await loginUser({
        email,
        password,
      }).unwrap();

      // Logging the response from loginUser API

      // Check if the login was unsuccessful
      if (statusCode !== 200) {
        console.warn(
          "Login failed with status code:",
          statusCode,
          "Message:",
          message
        );
        setAlertMessage(t("auth.loginFailed" + message)); // translation key
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      // Proceed if the login was successful
      const userId = id;

      if (userId) {
        // Dispatch an action to get the user role by ID
        const result = await dispatch(
          authApi.endpoints.getUserRoleById.initiate(userId)
        );

        // Check if the fetch was successful
        if ("data" in result) {
          const user = result.data as User;

          if (!user.role) {
            setAlertMessage(t("auth.roleNotAssigned" + message)); // translation key

            setAlertSeverity("info"); // Changed to "info" severity
            setAlertOpen(true);
            return;
          }

          if (user.role === "guest") {
            setAlertMessage(t("auth.accountVerificationPending" + message)); // translation key

            setAlertSeverity("error");
            setAlertOpen(true);
            return;
          }

          await dispatch(
            handleLogin({
              role: user.role,
              id: user.entityCode,
              userId: user._id,
            })
          );

          // Set the current user in the userSlice for consistent state management
          dispatch(setCurrentUser(user));

          // Save auth state if 'Keep me signed in' is selected
          if (keepMeSignedIn) {
            saveAuthState(store.getState().auth);
          }

          onClose();
        } else if ("error" in result) {
          showToast.error(t("auth.roleFetchingError", { error: result.error })); // Toast for role fetching error
          throw new FetchUserRoleError(t("auth.roleFetchingError"));
        }
      } else {
        showToast.error(t("auth.userNotFound")); // Toast for user ID missing
        setAlertMessage(t("auth.userNotFound"));
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
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

      showToast.error(errorMessage); // Toast for general login error
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

    const googleAuthUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/oauth2/google?state=${state}`;
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
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== import.meta.env.VITE_API_BASE_URL) {
        return;
      }

      const { status, state, user } = event.data;
      const expectedState = sessionStorage.getItem("oauth_state");
      sessionStorage.removeItem("oauth_state");

      if (state !== expectedState) {
        showToast.error(t("auth.invalidStateParameter")); // Toast for invalid OAuth state
        return;
      }

      if (status === "success" && user) {
        showToast.success(t("auth.googleLoginSuccess")); // Toast for Google OAuth success
        dispatch(
          handleLogin({
            role: user.role,
            id: user.entityCode,
            userId: user._id,
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
