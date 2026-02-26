import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: JSX.Element;
  moduleCode?: string; // modul pe care îl protejăm
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
