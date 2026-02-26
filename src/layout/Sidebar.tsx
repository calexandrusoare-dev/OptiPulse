/**
 * OptiPulse - Sidebar Component
 * Main navigation sidebar with RBAC module filtering
 */

import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"
import { supabase } from "../api/supabaseClient"
import { getUserModules } from "../lib/rbac"

interface NavItem {
  label: string
  to: string
  module: string
  icon?: string
}

export default function Sidebar() {
  const { permissions } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const userModules = getUserModules(permissions)

  const navItems: NavItem[] = [
    // HR Module
    {
      label: "Cereri Concediu",
      to: "/hr/leave-requests",
      module: "hr",
      icon: "📋",
    },
    {
      label: "Planificare Concediu",
      to: "/hr/leave-planning",
      module: "hr",
      icon: "📅",
    },
    {
      label: "Ore Suplimentare",
      to: "/hr/overtime",
      module: "hr",
      icon: "⏰",
    },
    {
      label: "Ore Lucru",
      to: "/hr/time-entries",
      module: "hr",
      icon: "🕐",
    },

    // Finance Module
    {
      label: "Cheltuieli",
      to: "/finance/expenses",
      module: "finance",
      icon: "💰",
    },
    {
      label: "Bugete",
      to: "/finance/budgets",
      module: "finance",
      icon: "📊",
    },
    {
      label: "KPI",
      to: "/finance/kpi",
      module: "finance",
      icon: "📈",
    },

    // Admin Module
    {
      label: "Utilizatori",
      to: "/admin/users",
      module: "admin",
      icon: "👥",
    },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const isActive = (path: string) => location.pathname === path

  // Group nav items by module
  const groupedItems: Record<string, NavItem[]> = {}
  navItems.forEach((item) => {
    if (userModules.includes(item.module)) {
      if (!groupedItems[item.module]) {
        groupedItems[item.module] = []
      }
      groupedItems[item.module].push(item)
    }
  })

  const moduleNames: Record<string, string> = {
    hr: "Resurse Umane",
    finance: "Finanțe",
    admin: "Administrație",
  }

  return (
    <aside className="main-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">OptiPulse</div>

      {/* Navigation Sections */}
      {Object.entries(groupedItems).map(([module, items]) => (
        <nav key={module} className="sidebar-section">
          <h3 className="sidebar-title">{moduleNames[module] || module}</h3>
          <div className="sidebar-menu">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-item ${isActive(item.to) ? "active" : ""}`}
              >
                <span>{item.icon || "•"}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      ))}

      {/* Logout Button */}
      <button onClick={handleLogout} className="sidebar-logout">
        Deconectare
      </button>
    </aside>
  )
}