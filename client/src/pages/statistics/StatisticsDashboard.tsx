// src/pages/StatisticsDashboard.tsx
import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import Loader from "../../components/common/Loader";
import { selectUserRole } from "../../features/auth/authSlice";

// Lazy load the dashboard components
const AdminDashboard = React.lazy(() => import("../admin/AdminDashboard"));
const ClientDashboard = React.lazy(() => import("../client/ClientDashboard"));
const AgentDashboard = React.lazy(() => import("../agent/AgentDashboard"));

const StatisticsDashboard: React.FC = () => {
  const userRole = useAppSelector(selectUserRole);

  const renderDashboard = () => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "client":
        return <ClientDashboard />;
      case "agent":
        return <AgentDashboard />;
      default:
        return (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Unauthorized Access</h2>
            <p>You do not have permission to view this page.</p>
            <Link
              to="/dashboard"
              style={{
                color: "#1976d2",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Go to Dashboard
            </Link>
          </div>
        );
    }
  };

  return <Suspense fallback={<Loader fadeout />}>{renderDashboard()}</Suspense>;
};

export default StatisticsDashboard;
