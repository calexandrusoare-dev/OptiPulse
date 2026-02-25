import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"

import LoginPage from "../pages/LoginPage"
import MainLayout from "../layout/MainLayout"

import LeaveRequests from "../modules/hr/LeaveRequests"
import LeavePlanning from "../modules/hr/LeavePlanning"
import ExpenseRequests from "../modules/finance/ExpenseRequests"
import Users from "../modules/admin/Users"

function ProtectedRoute({
  children,
  module,
}: {
  children: JSX.Element
  module?: string
}) {
  const { session, permissions } = useAuth()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (module) {
    const hasAccess = permissions.some(
      (p) => p.module === module
    )

    if (!hasAccess) {
      return <Navigate to="/login" replace />
    }
  }

  return children
}

export default function AppRouter() {
  const { session } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/hr/leave-requests" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Protected area */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="hr/leave-requests"
            element={
              <ProtectedRoute module="hr">
                <LeaveRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="hr/leave-planning"
            element={
              <ProtectedRoute module="hr">
                <LeavePlanning />
              </ProtectedRoute>
            }
          />

          <Route
            path="finance/expenses"
            element={
              <ProtectedRoute module="finance">
                <ExpenseRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <ProtectedRoute module="admin">
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}