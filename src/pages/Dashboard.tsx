/**
 * OptiPulse - Dashboard Home Page
 * Welcome and quick navigation
 */

import { useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import { getUserModules, getPermissionMatrix } from "../lib/rbac"

export default function Dashboard() {
  const { user, permissions, refreshPermissions } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  const userModules = getUserModules(permissions)
  const permissionMatrix = getPermissionMatrix(permissions)

  const handleRefreshPermissions = async () => {
    setRefreshing(true)
    try {
      await refreshPermissions()
    } finally {
      setRefreshing(false)
    }
  }

  const moduleIcons: Record<string, string> = {
    hr: "👥",
    finance: "💰",
    admin: "⚙️",
  }

  const moduleNames: Record<string, string> = {
    hr: "Resurse Umane",
    finance: "Finanțe",
    admin: "Administrație",
  }

  const moduleDescription: Record<string, string> = {
    hr: "Manage leave, overtime, and time tracking",
    finance: "Track expenses, budgets, and KPIs",
    admin: "Administer users and permissions",
  }

  return (
    <div>
      <div className="content-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="content-title">Welcome, {user?.full_name || user?.email}</h2>
        <button
          onClick={handleRefreshPermissions}
          disabled={refreshing}
          title="Refresh permissions from server"
          style={{
            padding: "8px 12px",
            backgroundColor: refreshing ? "var(--gray-400)" : "var(--primary-color)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: refreshing ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: "600",
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          {refreshing ? "Refreshing..." : "🔄"}
        </button>
      </div>

      <div
        style={{
          backgroundColor: "var(--primary-light)",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          borderLeft: "4px solid var(--primary-color)",
        }}
      >
        <p>
          <strong>OptiPulse v1.0</strong> - Enterprise Management System
        </p>
        <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--gray-600)" }}>
          Manage your organization's resources efficiently with role-based access control.
        </p>
      </div>

      {userModules.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔐</div>
          <h3 className="empty-state-title">No Modules Assigned</h3>
          <p className="empty-state-description">
            Contact your administrator to request access to modules.
          </p>
          {/* helpful debug info for developers/admins */}
          <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--gray-600)" }}>
            <strong>Debug:</strong> permissions loaded from backend:
            <pre
              style={{
                maxHeight: "150px",
                overflow: "auto",
                background: "#f9f9f9",
                padding: "8px",
                borderRadius: "4px",
                marginTop: "4px",
              }}
            >
              {JSON.stringify(permissions, null, 2)}
            </pre>
            <button
              onClick={handleRefreshPermissions}
              disabled={refreshing}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                backgroundColor: "var(--primary-color)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: refreshing ? "not-allowed" : "pointer",
                opacity: refreshing ? 0.6 : 1,
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {refreshing ? "Refreshing..." : "🔄 Refresh Permissions"}
            </button>
          </div>
        </div>
      )}

      {userModules.length > 0 && (
        <>
          <h3 style={{ marginBottom: "20px", color: "var(--gray-900)" }}>
            Your Modules
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            {userModules.map((moduleCode) => (
              <div key={moduleCode} className="card">
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    {moduleIcons[moduleCode] || "📦"}
                  </div>
                  <h4 style={{ marginBottom: "4px" }}>
                    {moduleNames[moduleCode] || moduleCode}
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--gray-600)",
                      marginBottom: "12px",
                    }}
                  >
                    {moduleDescription[moduleCode] || "Module"}
                  </p>

                  <div style={{ marginBottom: "12px" }}>
                    <small style={{ color: "var(--gray-500)", fontWeight: "600" }}>
                      Permissions:
                    </small>
                    <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {permissionMatrix[moduleCode]?.map((perm) => (
                        <span
                          key={perm}
                          style={{
                            backgroundColor: "var(--primary-light)",
                            color: "var(--primary-color)",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: "20px", color: "var(--gray-900)" }}>
            Quick Stats
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="card">
              <div style={{ color: "var(--gray-600)", fontSize: "12px", marginBottom: "8px" }}>
                MODULES ASSIGNED
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--primary-color)" }}>
                {userModules.length}
              </div>
            </div>

            <div className="card">
              <div style={{ color: "var(--gray-600)", fontSize: "12px", marginBottom: "8px" }}>
                TOTAL PERMISSIONS
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--success-color)" }}>
                {permissions.length}
              </div>
            </div>

            <div className="card">
              <div style={{ color: "var(--gray-600)", fontSize: "12px", marginBottom: "8px" }}>
                SYSTEM STATUS
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--success-color)" }}>
                ✓ Operational
              </div>
            </div>
          </div>
        </>
      )}

      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid var(--gray-200)",
          fontSize: "12px",
          color: "var(--gray-500)",
          textAlign: "center",
        }}
      >
        <p>OptiPulse © 2024 - Enterprise Management System</p>
      </div>
    </div>
  )
}
