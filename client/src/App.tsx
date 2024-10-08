// src/App.tsx
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import Loader from "./components/common/Loader";
import "./components/statistics/grids/AGGridTable.css"; // Import the custom AG Grid CSS
import { getTimeMs } from "./config/config";
import { selectIsLoggedIn, selectUserRole } from "./features/auth/authSlice";
import { handleLogout } from "./features/auth/authThunks";
import { fetchUserById, setCurrentUser } from "./features/users/userSlice";
import Layout from "./layout/Layout";
import { UserRole } from "./models/entityModels";
import StatisticsDashboard from "./pages/statistics/StatisticsDashboard";
import { refreshAccessToken } from "./services/sessionService";
import { showToast } from "./services/toastMessage";
import {
  cleanupStaleFiles,
  enforceCacheSizeLimit,
  initializeUserEncryption,
} from "./utils/cacheUtils";
/* console.log("Vite mode:", import.meta.env.MODE);
 */

// Lazy load components for performance optimization
const LandingPage = lazy(() => import("./pages/landing/LandingPage"));
const ArticlesPage = lazy(() => import("./pages/common/ArticlesPage"));
const CalendarPage = lazy(() => import("./pages/common/CalendarPage"));
const ChatPage = lazy(() => import("./pages/common/ChatPage"));
const ClientsPage = lazy(() => import("./pages/common/ClientsPage"));
const MovementsPage = lazy(() => import("./pages/common/MovementsPage"));
const PromosPage = lazy(() => import("./pages/common/PromosPage"));
const UserPage = lazy(() => import("./pages/common/UserPage"));
const VisitsPage = lazy(() => import("./pages/common/VisitsPage"));
const EmployeeDashboard = lazy(
  () => import("./pages/employee/EmployeeDashboard")
);

const timeMS = getTimeMs(); // Ensure this is set in your .env file

const ALLOWED_ROLES_FOR_PROTECTED_ROUTES: UserRole[] = [
  "admin",
  "client",
  "agent",
];

const ALLOWED_ROLES_FOR_UNPROTECTED_ROUTES: UserRole[] = [
  "admin",
  "client",
  "agent",
  "employee",
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
    element: (
      <Suspense fallback={<Loader fadeout />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      // Default Dashboard Route
      {
        path: "dashboard",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_UNPROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <EmployeeDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // Statistics Route
      {
        path: "statistics",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <StatisticsDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // Removed individual dashboard routes (agent-dashboard, admin-dashboard, client-dashboard)
      {
        path: "clients",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <ClientsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "articles",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <ArticlesPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "movements",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <MovementsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_UNPROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <ChatPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loader fadeout />}>
              <UserPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "visits",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <VisitsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "promos",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_PROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <PromosPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "calendar",
        element: (
          <ProtectedRoute requiredRoles={ALLOWED_ROLES_FOR_UNPROTECTED_ROUTES}>
            <Suspense fallback={<Loader fadeout />}>
              <CalendarPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // Redirect any unknown routes to /dashboard or another appropriate page
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);


const theme = createTheme({
  typography: {
    fontFamily: [
      "SF Pro Display",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Public Sans"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  palette: {
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },
});

// src/App.tsx
function App() {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true); // Initialization state

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await cleanupStaleFiles();
      } catch (error) {
        console.error("Error cleaning up stale files:", error);
      }

      try {
        await enforceCacheSizeLimit();
      } catch (error) {
        console.error("Error enforcing cache size limit:", error);
      }

      try {
        // Check if the auth state is present in the local storage
        const localAuthState = localStorage.getItem("authState");
        if (!localAuthState) {
          // console.debug("No auth state found in local storage");
          setIsInitializing(false); // Initialization complete
          return;
        }

        const storedAuthState = JSON.parse(localAuthState);

        // console.debug("Auth state:", storedAuthState);

        // Check if user is logged in and has a valid role (not "guest")
        if (storedAuthState.isLoggedIn && storedAuthState.role !== "guest") {
          /* console.debug(
            "User is logged in and has a valid role, attempting to refresh session"
          ); */

          // Attempt to refresh the session to validate and extend it on the server side
          const refreshSuccessful = await refreshAccessToken();

          if (refreshSuccessful) {
            // Fetch current user data based on user ID stored in auth state
            if (storedAuthState.userId) {
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
                  timeMS: timeMS, // Ensure this is set in your .env file
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
      } catch (error) {
        console.error("Initialization error:", error);
        showToast.error("An error occurred during initialization.");
        dispatch(handleLogout());
      } finally {
        setIsInitializing(false); // Mark initialization as complete
      }
    };

    initializeApp();
  }, [dispatch]);

  // Conditional rendering based on initialization state
  if (isInitializing) {
    return <Loader fadeout={!isInitializing} />;
  }

  // Main application rendering after initialization
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
