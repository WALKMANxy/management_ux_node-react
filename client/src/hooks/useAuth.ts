import { useAppDispatch } from "../app/hooks";
import store from "../app/store";
import { handleLogin, handleLogout } from "../features/auth/authSlice";
import { User } from "../models/entityModels";
import {
  authApi,
  useLoginUserMutation,
  useRegisterUserMutation,
} from "../services/authQueries";
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
    setAlertSeverity: (severity: "success" | "error") => void,
    setAlertOpen: (open: boolean) => void,
    onClose: () => void,
    keepMeSignedIn: boolean
  ) => {
    /* console.log("Initiate login started with the following parameters:", {
      email,
      keepMeSignedIn,
    }); */

    try {
      /*       console.log("Attempting to log in user with email:", email);
       */
      // Attempt to log in the user
      const { redirectUrl, id, message, statusCode } = await loginUser({
        email,
        password,
      }).unwrap();

      // Logging the response from loginUser API
      /* console.log("Login response received:", {
        redirectUrl,
        id,
        message,
        statusCode,
      }); */

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
      /*       console.log("User ID received after login:", userId);
       */
      if (userId) {
        /*         console.log("Fetching user role for user ID:", userId);
         */
        // Dispatch an action to get the user role by ID
        const result = await dispatch(
          authApi.endpoints.getUserRoleById.initiate(userId)
        );

        // Log the result of the fetch user role action
        /*         console.log("Fetch user role result:", result);
         */
        // Check if the fetch was successful
        if ("data" in result) {
          const user = result.data as User;
          /*           console.log("User data retrieved:", user);
           */
          // Check if the user's role is 'guest'
          if (user.role === "guest") {
            console.warn(
              "User has a 'guest' role, account verification required."
            );
            setAlertMessage(
              "Your account is still being verified by the admins."
            );
            setAlertSeverity("error");
            setAlertOpen(true);
            return;
          }

          // Dispatch login action with user data
          /* console.log("Dispatching handleLogin with user data:", {
            role: user.role,
            id: user.entityCode,
            userId: user._id,
          }); */

          dispatch(
            handleLogin({
              role: user.role,
              id: user.entityCode,
              userId: user._id,
            })
          );

          // Save auth state if 'Keep me signed in' is selected
          if (keepMeSignedIn) {
            /* console.log(
              "Saving auth state due to 'Keep me signed in' selection."
            ); */
            saveAuthState(store.getState().auth);
          }

          // Log the updated authentication state
          /* const state = store.getState();
          console.log("Updated auth state after handleLogin:", state.auth);
 */
          // Redirect to the URL specified by the server after successful login
          /*           console.log("Redirecting to:", redirectUrl);
           */ window.location.href = redirectUrl;
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
      // Catch and log any errors during the login process
      console.error("An error occurred during the login process:", error);

      // Create a new LoginError with the error message
      const loginError = new LoginError((error as Error).message);
      setAlertMessage(loginError.message);
      setAlertSeverity("error");
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

  return { initiateRegister, initiateLogin, initiateLogout };
};
