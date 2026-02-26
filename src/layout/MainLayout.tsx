/**
 * OptiPulse - Main Layout Component
 * Two-column enterprise layout with sidebar and main content area
 */

import { Outlet } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"
import Sidebar from "./Sidebar"

export default function MainLayout() {
  const { user } = useAuth()

  return (
    <div className="main-layout">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Header */}
      <header className="main-header">
        <div>
          <h1 className="header-title">OptiPulse Dashboard</h1>
        </div>
        <div className="header-user">
          <span>{user?.full_name || user?.email}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}