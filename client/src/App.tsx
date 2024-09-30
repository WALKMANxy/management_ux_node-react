// src/App.tsx
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { lazy, Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./components/statistics/grids/AGGridTable.css"; // Import the custom AG Grid CSS
import { getTimeMs } from "./config/config";
import {
  handleLogout,
  selectIsLoggedIn,
  selectUserRole,
} from "./features/auth/authSlice";
import { fetchUserById, setCurrentUser } from "./features/users/userSlice";
import Layout from "./layout/Layout";
import { UserRole } from "./models/entityModels";
import LandingPage from "./pages/landing/LandingPage";
import { refreshSession } from "./services/sessionService";
import { initializeUserEncryption } from "./utils/cacheUtils";
import { showToast } from "./utils/toastMessage";
/* console.log("Vite mode:", import.meta.env.MODE);
 */

// Lazy load components for performance optimization
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AgentDashboard = lazy(() => import("./pages/agent/AgentDashboard"));
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const ArticlesPage = lazy(() => import("./pages/common/ArticlesPage"));
const CalendarPage = lazy(() => import("./pages/common/CalendarPage"));
const ChatPage = lazy(() => import("./pages/common/ChatPage"));
const ClientsPage = lazy(() => import("./pages/common/ClientsPage"));
const MovementsPage = lazy(() => import("./pages/common/MovementsPage"));
const PromosPage = lazy(() => import("./pages/common/PromosPage"));
const UserPage = lazy(() => import("./pages/common/UserPage"));
const VisitsPage = lazy(() => import("./pages/common/VisitsPage"));

const timeMS = getTimeMs(); // Ensure this is set in your .env file

const ALLOWED_ROLES_FOR_PROTECTED_ROUTES: UserRole[] = [
  "admin",
  "client",
  "agent",
];

// Enhanced ProtectedRoute to include role-based protection
interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRoles?: UserRole[]; // Allow multiple roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  // Separate the selectors to avoid returning a new object reference on each render
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const role = useAppSelector(selectUserRole);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(role)) {
    return <Navigate to="/" replace />;
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
          <ProtectedRoute requiredRoles={["agent"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <AgentDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "client-dashboard",
        element: (
          <ProtectedRoute requiredRoles={["client"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "clients",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "articles",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<LoadingSpinner />}>
              <ArticlesPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "movements",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<LoadingSpinner />}>
              <MovementsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<LoadingSpinner />}>
              <ChatPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <UserPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "visits",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<LoadingSpinner />}>
              <VisitsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "promos",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<LoadingSpinner />}>
              <PromosPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "calendar",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<LoadingSpinner />}>
              <CalendarPage />
            </Suspense>
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
      // Check if the auth state is present in the local storage
      const localAuthState = localStorage.getItem("authState");

      // If the auth state is present and the user is logged in
      if (localAuthState) {
        const storedAuthState = JSON.parse(localAuthState);

        // Check if user is logged in and has a valid role (not "guest")
        if (storedAuthState.isLoggedIn && storedAuthState.role !== "guest") {
          // Attempt to refresh the session to validate and extend it on the server side
          const refreshSuccessful = await refreshSession();

          if (refreshSuccessful) {
            // Fetch current user data based on user ID stored in auth state
            if (storedAuthState.userId) {
              // Fetch the current user and update userSlice
              try {
                const user = await dispatch(
                  fetchUserById(storedAuthState.userId)
                ).unwrap();

                dispatch(setCurrentUser(user)); // Update the userSlice with the fetched user
                // Derive and initialize the encryption key
                const userId = user._id; // Assuming user._id is the unique identifier

                // Initialize encryption using the custom utility
                await initializeUserEncryption({
                  userId,
                  timeMS,
                });
              } catch (error) {
                console.error("Failed to fetch current user:", error);
                showToast.error("Failed to initialize user data.");
                dispatch(handleLogout()); // Force logout if fetching user fails
              }
            }
          } else {
            console.warn("Session refresh failed or session expired.");
            dispatch(handleLogout());
          }
        } else {
          console.warn(
            "User is either not logged in or has an invalid role ('guest')."
          );
          dispatch(handleLogout()); // Ensure logout if role is invalid
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
