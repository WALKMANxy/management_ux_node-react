import { useDispatch } from "react-redux";
import store, { AppDispatch } from "../app/store"; // Import AppDispatch type from your store
import { /* fetchLinkedEntities, */ login, logout } from "../features/auth/authSlice";
import { User } from "../models/entityModels"; // Import your User type
import {
  api,
  useLoginUserMutation,
  useRegisterUserMutation,
} from "../services/api";
import { clearAuthData } from "../utils/authHelpers";
import {
  FetchUserRoleError,
  LoginError,
  RegistrationError,
} from "../utils/errorHandling";
import { saveAuthState } from "../utils/localStorage";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>(); // Type your dispatch with AppDispatch
  const [registerUser] = useRegisterUserMutation();
  const [loginUser] = useLoginUserMutation();

  const handleRegister = async (
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

  const handleLogin = async (
    email: string,
    password: string,
    setAlertMessage: (message: string) => void,
    setAlertSeverity: (severity: "success" | "error") => void,
    setAlertOpen: (open: boolean) => void,
    onClose: () => void,
    keepMeSignedIn: boolean
  ) => {
    try {
      const { redirectUrl, id, message, statusCode } = await loginUser({
        email,
        password,
      }).unwrap();

      if (statusCode !== 200) {
        setAlertMessage(message);
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      const userId = id;

      if (userId) {
        const result = await dispatch(
          api.endpoints.getUserRoleById.initiate(userId)
        );

        if ("data" in result) {
          const user = result.data as User;

          if (user.role === "guest") {
            setAlertMessage(
              "Your account is still being verified by the admins."
            );
            setAlertSeverity("error");
            setAlertOpen(true);
            return;
          }

          dispatch(login({ role: user.role, id: user.entityCode }));

          /* // Fetch linked entities
          await dispatch(fetchLinkedEntities()); */

          // Save auth state if "Keep me signed in" is checked
          if (keepMeSignedIn) {
            saveAuthState(store.getState().auth);
          }

          const state = store.getState(); // If not inside a React component, otherwise use `useSelector`
          console.log("Updated auth state:", state.auth);

          window.location.href = redirectUrl;
          onClose();
        } else if ("error" in result) {
          throw new FetchUserRoleError("Failed to fetch user role");
        }
      }
    } catch (error) {
      const loginError = new LoginError((error as Error).message);
      setAlertMessage(loginError.message);
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const handleLogout = (
    setAlertMessage: (message: string) => void,
    setAlertSeverity: (severity: "success" | "error") => void,
    setAlertOpen: (open: boolean) => void
  ) => {
    try {
      clearAuthData();
      dispatch(logout());
      setAlertMessage("User logged out successfully.");
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (error: unknown) {
      // Ensure error is an instance of Error before proceeding
      if (error instanceof Error) {
        const logoutError = new Error("Failed to log out.");
        setAlertMessage(logoutError.message);
        setAlertSeverity("error");
        setAlertOpen(true);
      } else {
        // Handle the case where the error is not an instance of Error
        setAlertMessage("An unexpected error occurred.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    }
  };

  return { handleRegister, handleLogin, handleLogout };
};
