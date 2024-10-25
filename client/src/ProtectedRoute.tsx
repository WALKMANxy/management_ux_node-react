// ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAppSelector } from "./app/hooks";
import { selectIsLoggedIn, selectUserRole } from "./features/auth/authSlice";
import { UserRole } from "./models/entityModels";

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

export default ProtectedRoute;