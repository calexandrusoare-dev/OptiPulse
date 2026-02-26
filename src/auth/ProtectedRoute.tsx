/**
 * OptiPulse - ProtectedRoute Component
 * Route access control with RBAC
 */

import { Navigate, useLocation } from "react-router-dom"
import { ReactNode } from "react"
import { useAuth } from "./AuthProvider"
import { hasModuleAccess } from "../lib/rbac"

interface ProtectedRouteProps {
  children: ReactNode
  moduleCode?: string
  permissionCode?: string
  fallback?: ReactNode
}

/**
 * ProtectedRoute Component
 * Validates user authentication and RBAC permissions
 *
 * @param children Component to render if authorized
 * @param moduleCode Module code to check (optional)
 * @param permissionCode Specific permission to check (optional)
 * @param fallback Component to render if unauthorized (default: redirect to /login)
 */
export function ProtectedRoute({
  children,
  moduleCode,
  permissionCode,
  fallback = null,
}: ProtectedRouteProps): ReactNode {
  const { session, permissions } = useAuth()
  const location = useLocation()

  // Check if user is authenticated
  if (!session) {
    // Redirect to login page, preserving the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check module access if moduleCode is provided
  if (moduleCode) {
    const hasAccess = hasModuleAccess(
      permissions,
      moduleCode,
      permissionCode
    )

    if (!hasAccess) {
      // Render fallback or redirect to unauthorized page
      if (fallback) {
        return fallback
      }

      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
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
