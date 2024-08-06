// hooks/useAuth.ts

import { useDispatch } from "react-redux";
import {
  useRegisterUserMutation,
  useLoginUserMutation,
  api,
} from "../services/api";
import { login, logout } from "../features/auth/authSlice";
import {  clearAuthData } from "../utils/authHelpers";
import { User } from "../models/models"; // Import your User type
import store, { AppDispatch } from "../app/store"; // Import AppDispatch type from your store
import { FetchUserRoleError, LoginError, RegistrationError } from "../utils/errorHandling";
import Cookies from "js-cookie"; // Import js-cookie




// Logger utility function
const logError = (error: Error) => {
  console.error(`[${new Date().toISOString()}] ${error.name}: ${error.message}`);
};

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>(); // Type your dispatch with AppDispatch
  const [registerUser] = useRegisterUserMutation();
  const [loginUser] = useLoginUserMutation();

  const handleRegister = async (email: string, password: string) => {
    try {
      await registerUser({ email, password }).unwrap();
      alert("Registration successful. Please verify your email.");
    } catch (error) {
      const registrationError = new RegistrationError((error as Error).message);
      logError(registrationError);
      alert(registrationError.message);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { redirectUrl, id, authToken} = await loginUser({ email, password }).unwrap();

      const userId = id;

      Cookies.set("token", authToken, { expires: 7 }); // Expires in 7 days, you can adjust the expiry

      console.log( "User ID:", userId, "Token:", authToken);


      if (userId) {
        dispatch(api.endpoints.getUserRoleById.initiate(userId))
          .then((result) => {
            if ('data' in result) {
              const user = result.data as User;

              if (user.role === "guest") {
                alert("Your account is still being verified by the admins.");
                return;
              }

              dispatch(login({ role: user.role, id: user.entityCode }));

              const state = store.getState(); // If not inside a React component, otherwise use `useSelector`
              console.log("Updated auth state:", state.auth);


              window.location.href = redirectUrl;
            } else if ('error' in result) {
              throw new FetchUserRoleError('Failed to fetch user role');
            }
          })
          .catch((error) => {
            const fetchUserRoleError = new FetchUserRoleError((error as Error).message);
            logError(fetchUserRoleError);
            alert(fetchUserRoleError.message);
          });
      }
    } catch (error) {
      const loginError = new LoginError((error as Error).message);
      logError(loginError);
      alert(loginError.message);
    }
  };

  const handleLogout = () => {
    try {
      clearAuthData();
      dispatch(logout());
      console.log(`[${new Date().toISOString()}] User logged out successfully.`);
    } catch (error) {
      const logoutError = new Error("Failed to log out.");
      logError(logoutError);
    }
  };

  return { handleRegister, handleLogin, handleLogout };
};
