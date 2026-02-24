import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"
import LoginPage from "../pages/LoginPage"
import MainLayout from "../layout/MainLayout"
import LeaveRequests from "../modules/hr/LeaveRequests"
import LeavePlanning from "../modules/hr/LeavePlanning"
import ExpenseRequests from "../modules/finance/ExpenseRequests"
import Users from "../modules/admin/Users"

function ProtectedRoute({ children }: any) {
  const { session } = useAuth()

  if (!session) {
    return <Navigate to="/" />
  }

  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="hr/leave-requests" element={<LeaveRequests />} />
          <Route path="hr/leave-planning" element={<LeavePlanning />} />
          <Route path="finance/expenses" element={<ExpenseRequests />} />
          <Route path="admin/users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}