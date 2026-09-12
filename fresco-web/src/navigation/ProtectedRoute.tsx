import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "../components/common/Spinner";
import { ADMIN_ROLES } from "../constants/user.constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated, isRestoringToken } = useAuth();
  const location = useLocation();

  if (isRestoringToken) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <Spinner size="lg" color="var(--primary)" />
        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Loading FRESCO...
        </span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    const isAdmin = (ADMIN_ROLES as readonly string[]).includes(user.role);
    if (!isAdmin) {
      if (user.role === "DELIVERY_PARTNER") {
        return <Navigate to="/partner/tasks" replace />;
      }
      return <Navigate to="/catalog" replace />;
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(user.role);
    if (!isAllowed) {
      if ((ADMIN_ROLES as readonly string[]).includes(user.role)) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (user.role === "DELIVERY_PARTNER") {
        return <Navigate to="/partner/tasks" replace />;
      }
      return <Navigate to="/catalog" replace />;
    }
  }

  return <>{children}</>;
};
