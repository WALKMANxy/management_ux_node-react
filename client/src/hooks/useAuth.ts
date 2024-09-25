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

import {
  FetchUserRoleError,
  LoginError,
  RegistrationError,
} from "../utils/errorHandling";
import { saveAuthState } from "../utils/localStorage";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [registerUser] = useRegisterUserMutation();
  const [loginUser] = useLoginUserMutation();

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
      setAlertMessage(message);
      setAlertSeverity(statusCode === 201 ? "success" : "error");
      setAlertOpen(true);
    } catch (error) {
      const registrationError = new RegistrationError((error as Error).message);
      setAlertMessage(registrationError.message);
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
        setAlertMessage(message);
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
            setAlertMessage(
              "Please wait for your account to be assigned a role before attempting to log in."
            );
            setAlertSeverity("info"); // Changed to "info" severity
            setAlertOpen(true);
            return;
          }

          if (user.role === "guest") {
            setAlertMessage(
              "Your account is still being verified by the admins."
            );
            setAlertSeverity("error");
            setAlertOpen(true);
            return;
          }

          dispatch(
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
          // Handle the error when fetching the user role
          console.error("Error fetching user role:", result.error);
          throw new FetchUserRoleError("Failed to fetch user role");
        }
      } else {
        console.error("User ID is missing after successful login.");
        setAlertMessage("Failed to retrieve user information.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("An error occurred during the login process:", error);

      let errorMessage = "An error occurred during login.";
      let errorSeverity: "error" | "info" = "error";

      if (error instanceof FetchUserRoleError) {
        errorMessage =
          "Please wait for your account to be assigned a role before attempting to log in.";
        errorSeverity = "info";
      } else if (
        error instanceof Error &&
        error.message.includes("undefined")
      ) {
        errorMessage =
          "The server is currently unreachable, please try again later.";
      }

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
      setAlertMessage("User logged out successfully.");
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const logoutError = new Error("Failed to log out.");
        setAlertMessage(logoutError.message);
        setAlertSeverity("error");
        setAlertOpen(true);
      } else {
        setAlertMessage("An unexpected error occurred.");
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
      // Ensure the message is coming from your server's origin
      if (event.origin !== import.meta.env.VITE_API_BASE_URL) {
        return;
      }

      const { status, state, user } = event.data;

      const expectedState = sessionStorage.getItem("oauth_state");
      sessionStorage.removeItem("oauth_state");

      if (state !== expectedState) {
        console.error("Invalid state parameter");
        return;
      }

      if (status === "success" && user) {
        console.log("User logged in successfully via Google OAuth");
        dispatch(
          handleLogin({
            role: user.role,
            id: user.entityCode,
            userId: user._id,
          })
        );
      } else {
        console.error("Authentication failed via Google OAuth");
      }
    };

    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [dispatch]);

  return {
    initiateRegister,
    initiateLogin,
    initiateLogout,
    handleLoginWithGoogle,
  };
};
