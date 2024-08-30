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

  useEffect(() => {
    const initializeApp = async () => {
      // Check if the auth state is present in the session storage
      const sessionAuthState = sessionStorage.getItem("auth");

      // If the auth state is present and the user is logged in
      if (sessionAuthState) {
        const storedAuthState = JSON.parse(sessionAuthState);

        // Check if user is logged in and has a valid role (not "guest")
        if (storedAuthState.isLoggedIn && storedAuthState.role !== "guest") {
          // Attempt to refresh the session to validate and extend it on the server side
          const refreshSuccessful = await refreshSession();

          if (!refreshSuccessful) {
            console.warn("Session refresh failed or session expired.");
            dispatch(handleLogout());
          }
        }
      } else {
        console.warn("No auth state found in session storage.");
        // Optionally handle redirect to login or other logic here
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
