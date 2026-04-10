import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * RoleGuard – Only renders children if the user has one of the `allowedRoles`.
 * Otherwise redirects to /unauthorized.
 */
function RoleGuard({ allowedRoles = [], children }) {
  const { isAuthenticated, roles } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = allowedRoles.some((r) => roles.includes(r));
  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default RoleGuard;
