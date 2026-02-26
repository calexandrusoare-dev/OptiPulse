/**
 * OptiPulse - Application Router
 * Nested routes with RBAC protection on all routes
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"
import { ProtectedRoute, UnauthorizedPage } from "../auth/ProtectedRoute"

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
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard Route */}
          <Route
            index
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* HR Module Routes */}
          <Route path="hr">
            <Route
              path="leave-requests"
              element={
                <ProtectedRoute moduleCode="hr" permissionCode="view">
                  <LeaveRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="leave-planning"
              element={
                <ProtectedRoute moduleCode="hr" permissionCode="view">
                  <LeavePlanning />
                </ProtectedRoute>
              }
            />
            <Route
              path="overtime"
              element={
                <ProtectedRoute moduleCode="hr">
                  <Overtime />
                </ProtectedRoute>
              }
            />
            <Route
              path="time-entries"
              element={
                <ProtectedRoute moduleCode="hr">
                  <TimeEntries />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Finance Module Routes */}
          <Route path="finance">
            <Route
              path="expenses"
              element={
                <ProtectedRoute moduleCode="finance">
                  <ExpenseRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="budgets"
              element={
                <ProtectedRoute moduleCode="finance">
                  <Budgets />
                </ProtectedRoute>
              }
            />
            <Route
              path="kpi"
              element={
                <ProtectedRoute moduleCode="finance">
                  <KPI />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Module Routes */}
          <Route path="admin">
            <Route
              path="users"
              element={
                <ProtectedRoute moduleCode="admin" permissionCode="view">
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Catch-all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}