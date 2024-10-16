// src/App.tsx
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
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
import { theme } from "./Styles/theme";
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

// src/App.tsx
function App() {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true); // Initialization state

  useEffect(() => {
    let isMounted = true; // Flag to track if the component is mounted

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
      isMounted = false; // Cleanup flag on unmount
    };
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
