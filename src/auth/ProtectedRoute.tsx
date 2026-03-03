/**
 * OptiPulse - ProtectedRoute Component
 * Route access control with RBAC
 */


import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { session, permissions, loading, hasRole } = useAuth();
  const location = useLocation();

  // Așteaptă să se termine loading-ul auth
  if (loading) {
    return null;
  }

  // dacă nu este autentificat
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // dacă este autentificat dar nu are permisiunea cerută
  if (moduleCode) {
    // require any permission in the module (view/edit/create/…)
    const hasAccess = hasModuleAccess(permissions, moduleCode);
    // admins/super admins bypass all checks    if (!hasAccess && !hasRole('super_admin') && !hasRole('admin')) {
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
  const { t } = useTranslation();

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
      <h1>{t('accessDenied')}</h1>
      <p>{t('accessDeniedMessage')}</p>
      <p style={{ fontSize: "14px", color: "#666" }}>
        Contact your administrator if you believe this is an error.
      </p>
      <a href="/" style={{ marginTop: "20px", color: "#3b82f6" }}>
        {t('backToDashboard')}
      </a>
    </div>
  )
}
