// src/App.tsx
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import store, { RootState } from "./app/store";
import { login, logout } from "./features/auth/authSlice";
import Layout from "./layout/Layout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import ArticlesPage from "./pages/common/ArticlesPage";
import ClientsPage from "./pages/common/ClientsPage";
import MovementsPage from "./pages/common/MovementsPage";
import LandingPage from "./pages/landing/LandingPage";
import { webSocketService } from "./services/webSocket";
import { loadAuthState, saveAuthState } from "./utils/localStorage";

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/" />;
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
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "client-dashboard",
        element: (
          <ProtectedRoute>
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
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const handleSessionRefresh = useCallback(async () => {
    try {
      const success = await refreshSession();
      if (success) {
        // If session refresh is successful, ensure WebSocket is connected
        webSocketService.connect();
      } else {
        dispatch(logout());
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      dispatch(logout());
    }
  }, [dispatch]);

  useEffect(() => {
    const initializeApp = async () => {
      const storedAuthState = loadAuthState();
      if (storedAuthState && storedAuthState.isLoggedIn) {
        dispatch(login(storedAuthState));
        await handleSessionRefresh();
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
