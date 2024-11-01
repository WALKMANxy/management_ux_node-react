// src/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAppSelector } from "./app/hooks";
import { selectIsLoggedIn, selectUserRole } from "./features/auth/authSlice";
import { UserRole } from "./models/entityModels";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
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

export default ProtectedRoute;
