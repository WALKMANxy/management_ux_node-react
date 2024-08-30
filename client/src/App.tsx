// src/App.tsx
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useCallback, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import store, { RootState } from "./app/store";
import { handleLogin, handleLogout } from "./features/auth/authSlice"; // Import the thunks
import Layout from "./layout/Layout";
import { UserRole } from "./models/entityModels";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import ArticlesPage from "./pages/common/ArticlesPage";
import ClientsPage from "./pages/common/ClientsPage";
import MovementsPage from "./pages/common/MovementsPage";
import LandingPage from "./pages/landing/LandingPage";
import { refreshSession } from "./services/sessionService";
import { webSocketService } from "./services/webSocket";
import { loadAuthState, saveAuthState } from "./utils/localStorage";

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

console.log("Vite mode:", import.meta.env.MODE);


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
  const isLoggedIn = useAppSelector(
    (state: RootState) => state.auth.isLoggedIn
  );

  const handleSessionRefresh = useCallback(async () => {
    try {
      const success = await refreshSession();
      if (success) {
        // If session refresh is successful, ensure WebSocket is connected
        webSocketService.connect();
      } else {
        dispatch(handleLogout());
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      dispatch(handleLogout());
    }
  }, [dispatch]);

  useEffect(() => {
    const initializeApp = async () => {
      const storedAuthState = loadAuthState();

      // Check if storedAuthState exists, user is logged in, and id is not null or undefined
      if (storedAuthState && storedAuthState.isLoggedIn) {
        dispatch(handleLogin(storedAuthState));
        await handleSessionRefresh();
      } else if (!storedAuthState) {
        console.warn("Stored auth state is missing.");
        // Handle cases where the auth state is invalid, e.g., redirect to login or reset state
      } else if (storedAuthState && storedAuthState.isLoggedIn === false) {
        console.warn("Stored auth state is invalid.");
        // Handle cases where the auth state is invalid, e.g., redirect to login or reset state
      }
    };

    initializeApp();
  }, [dispatch, handleSessionRefresh]);

  useEffect(() => {
    if (isLoggedIn) {
      // Set up periodic session refresh
      const refreshInterval = setInterval(
        handleSessionRefresh,
        REFRESH_INTERVAL
      );

      // Set up WebSocket connection
      webSocketService.connect();

      return () => {
        clearInterval(refreshInterval);
        webSocketService.disconnect();
      };
    }
  }, [isLoggedIn, handleSessionRefresh]);

  useEffect(() => {
    // Update localStorage whenever auth state changes
    saveAuthState(store.getState().auth);
  }, [isLoggedIn]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
