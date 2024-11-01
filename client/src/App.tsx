// src/App.tsx
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useAppDispatch } from "./app/hooks";
import Loader from "./components/common/Loader";
import "./components/statistics/grids/AGGridTable.css";
import { getTimeMs } from "./config/config";
import { handleLogout } from "./features/auth/authThunks";
import { fetchUserById, setCurrentUser } from "./features/users/userSlice";
import router from "./router";
import { refreshAccessToken } from "./services/sessionService";
import { showToast } from "./services/toastMessage";
import { theme } from "./Styles/theme";
import {
  cleanupStaleFiles,
  enforceCacheSizeLimit,
  initializeUserEncryption,
} from "./utils/cacheUtils";

// console.log("Vite mode:", import.meta.env.MODE);

const timeMS = getTimeMs();

function App() {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      if (!isMounted) return;

      try {
        await cleanupStaleFiles();
        await enforceCacheSizeLimit();

        const localAuthState = localStorage.getItem("authState");
        if (!localAuthState) {
          setIsInitializing(false);
          return;
        }

        const storedAuthState = JSON.parse(localAuthState);

        if (storedAuthState.isLoggedIn && storedAuthState.role !== "guest") {
          const refreshSuccessful = await refreshAccessToken();

          if (refreshSuccessful && storedAuthState.userId) {
            try {
              const user = await dispatch(
                fetchUserById(storedAuthState.userId)
              ).unwrap();
              dispatch(setCurrentUser(user));

              await initializeUserEncryption({
                userId: user._id,
                timeMS: timeMS,
              });
            } catch (error) {
              console.error("Failed to fetch current user:", error);
              dispatch(handleLogout());
            }
          } else {
            console.warn("Session refresh failed or session expired.");
            dispatch(handleLogout());
          }
        } else {
          console.warn(
            "User is either not logged in or has an invalid role ('guest')."
          );
          dispatch(handleLogout());
        }
      } catch (error) {
        console.error("Initialization error:", error);
        showToast.error("An error occurred during initialization.");
        dispatch(handleLogout());
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (isInitializing) {
    return <Loader fadeout={!isInitializing} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
