/**
 * OptiPulse - Application Router
 * Nested routes with RBAC protection on all routes
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"
import { ProtectedRoute } from "../auth/ProtectedRoute"
import AccessDenied from "../pages/AccessDenied"

// Pages
import LoginPage from "../pages/LoginPage"
import MainLayout from "../layout/MainLayout"
import Dashboard from "../pages/Dashboard"

// HR Module
import LeaveRequests from "../modules/hr/LeaveRequests"
import LeavePlanning from "../modules/hr/LeavePlanning"
import Overtime from "../modules/hr/Overtime"
import TimeEntries from "../modules/hr/TimeEntries"

// Finance Module
import ExpenseRequests from "../modules/finance/ExpenseRequests"
import Budgets from "../modules/finance/Budgets"
import KPI from "../modules/finance/KPI"

// Admin Module
import Users from "../modules/admin/Users"

export default function AppRouter() {
  const { session, loading } = useAuth()

  // Show loading state while auth initializes
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div className="loading"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Dashboard Route */}
          <Route index element={<Dashboard />} />

          {/* HR Module Routes */}
          <Route path="hr/leave-requests" element={<ProtectedRoute moduleCode="hr"><LeaveRequests /></ProtectedRoute>} />
          <Route path="hr/leave-planning" element={<ProtectedRoute moduleCode="hr"><LeavePlanning /></ProtectedRoute>} />
          <Route path="hr/overtime" element={<ProtectedRoute moduleCode="hr"><Overtime /></ProtectedRoute>} />
          <Route path="hr/time-entries" element={<ProtectedRoute moduleCode="hr"><TimeEntries /></ProtectedRoute>} />

          {/* Finance Module Routes */}
          <Route path="finance/expenses" element={<ProtectedRoute moduleCode="finance"><ExpenseRequests /></ProtectedRoute>} />
          <Route path="finance/budgets" element={<ProtectedRoute moduleCode="finance"><Budgets /></ProtectedRoute>} />
          <Route path="finance/kpi" element={<ProtectedRoute moduleCode="finance"><KPI /></ProtectedRoute>} />

          {/* Admin Module Routes */}
          <Route path="admin/users" element={<ProtectedRoute moduleCode="admin"><Users /></ProtectedRoute>} />
        </Route>

        {/* Catch-all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}