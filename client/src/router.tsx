/* eslint-disable react-refresh/only-export-components */
//src/router.tsx
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Loader from "./components/common/Loader";
import Layout from "./layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import {
  ALLOWED_ROLES_FOR_PROTECTED_ROUTES,
  ALLOWED_ROLES_FOR_UNPROTECTED_ROUTES,
} from "./utils/constants";

const LandingPage = lazy(() => import("./pages/landing/LandingPage"));
const ArticlesPage = lazy(() => import("./pages/common/ArticlesPage"));
const CalendarPage = lazy(() => import("./pages/common/CalendarPage"));
const ChatPage = lazy(() => import("./pages/common/ChatPage"));
const ClientsPage = lazy(() => import("./pages/common/ClientsPage"));
const MovementsPage = lazy(() => import("./pages/common/MovementsPage"));
const PromosPage = lazy(() => import("./pages/common/PromosPage"));
const UserPage = lazy(() => import("./pages/common/UserPage"));
const VisitsPage = lazy(() => import("./pages/common/VisitsPage"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const StatisticsDashboard = lazy(
  () => import("./pages/statistics/StatisticsDashboard")
);

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
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
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
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

export default router;
