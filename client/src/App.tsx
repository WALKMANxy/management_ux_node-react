// src/App.tsx
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { RootState } from "./app/store";
import { handleLogout } from "./features/auth/authSlice";
import { fetchUserById, setCurrentUser } from "./features/users/userSlice";
import Layout from "./layout/Layout";
import { UserRole } from "./models/entityModels";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import ArticlesPage from "./pages/common/ArticlesPage";
import ChatPage from "./pages/common/ChatPage";
import ClientsPage from "./pages/common/ClientsPage";
import MovementsPage from "./pages/common/MovementsPage";
import LandingPage from "./pages/landing/LandingPage";
import { refreshSession } from "./services/sessionService";
import UserPage from "./pages/common/UserPage";
import VisitsPage from "./pages/common/VisitsPage";

/* console.log("Vite mode:", import.meta.env.MODE);
 */

// Enhanced ProtectedRoute to include role-based protection
const ProtectedRoute: React.FC<{
  children: JSX.Element;
  requiredRole?: UserRole;
}> = ({ children, requiredRole }) => {
  const isLoggedIn = useAppSelector(
    (state: RootState) => state.auth.isLoggedIn
  );
  const userRole = useAppSelector((state: RootState) => state.auth.role);

  // Check if the user is logged in and has the correct role, if a role is required
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "agent-dashboard",
        element: (
          <ProtectedRoute requiredRole="agent">
            <AgentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "client-dashboard",
        element: (
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "clients",
        element: (
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "articles",
        element: (
          <ProtectedRoute>
            <ArticlesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "movements",
        element: (
          <ProtectedRoute>
            <MovementsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "visits",
        element: (
          <ProtectedRoute>
            <VisitsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const theme = createTheme({
  palette: {
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },
});

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      /*       console.debug("Initializing app...");
       */
      // Check if the auth state is present in the local storage
      const localAuthState = localStorage.getItem("authState");
      /*       console.debug("Local auth state:", localAuthState);
       */
      // If the auth state is present and the user is logged in
      if (localAuthState) {
        const storedAuthState = JSON.parse(localAuthState);
        /*         console.debug("Parsed auth state:", storedAuthState);
         */
        // Check if user is logged in and has a valid role (not "guest")
        if (storedAuthState.isLoggedIn && storedAuthState.role !== "guest") {
          /*           console.debug("User is logged in with role:", storedAuthState.role);
           */
          // Attempt to refresh the session to validate and extend it on the server side
          const refreshSuccessful = await refreshSession();
          /*           console.debug("Session refresh result:", refreshSuccessful);
           */
          if (refreshSuccessful) {
            // Fetch current user data based on user ID stored in auth state
            if (storedAuthState.userId) {
              /* console.debug(
                "Fetching user data for user ID:",
                storedAuthState.userId
              );
 */
              // Fetch the current user and update userSlice
              try {
                const user = await dispatch(
                  fetchUserById(storedAuthState.userId)
                ).unwrap();
                /*                 console.debug("Fetched user data:", user);
                 */
                dispatch(setCurrentUser(user)); // Update the userSlice with the fetched user
              } catch (error) {
                console.error("Failed to fetch current user:", error);
              }
            } else {
              /*               console.warn("User ID not found in stored auth state.");
               */
            }
          } else {
            console.warn("Session refresh failed or session expired.");
            dispatch(handleLogout());
          }
        } else {
          console.warn(
            "User is either not logged in or has an invalid role ('guest')."
          );
        }
      } 
    };

    initializeApp();
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
