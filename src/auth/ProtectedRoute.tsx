/**
 * OptiPulse - ProtectedRoute Component
 * Route access control with RBAC
 */


import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { hasModuleAccess } from "../lib/rbac";

interface ProtectedRouteProps {
  children: JSX.Element;
  moduleCode?: string;
}

export default function ProtectedRoute({
  children,
  moduleCode,
}: ProtectedRouteProps) {
  const { session, permissions } = useAuth();
  const location = useLocation();

  // dacă nu este autentificat
  if (!session) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // dacă este autentificat dar nu are permisiunea cerută
  if (moduleCode) {
    const hasAccess = permissions?.some(
      (p) =>
        p.module_code === moduleCode && p.permission_code === "view"
    );

    if (!hasAccess) {
      // îl trimitem către o pagină de acces refuzat
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children;
}

/**
 * Unauthorized Page Component
 * Displayed when user lacks required permissions
 */
export function UnauthorizedPage(): ReactNode {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        backgroundColor: "#f3f4f6",
      }}
    >
      <h1>Access Denied</h1>
      <p>You do not have permission to access this resource.</p>
      <p style={{ fontSize: "14px", color: "#666" }}>
        Contact your administrator if you believe this is an error.
      </p>
      <a href="/" style={{ marginTop: "20px", color: "#3b82f6" }}>
        ← Back to Dashboard
      </a>
    </div>
  )
}
