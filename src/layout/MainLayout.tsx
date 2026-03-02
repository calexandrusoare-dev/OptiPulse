/**
 * OptiPulse - Main Layout Component
 * Two-column enterprise layout with sidebar and main content area
 */

import { Outlet } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"
import Sidebar from "./Sidebar"
import { useTranslation } from 'react-i18next'

export default function MainLayout() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()

  const switchLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <div className="main-layout">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Header */}
      <header className="main-header">
        <div>
          <h1 className="header-title">{t('appTitle')}</h1>
        </div>
        <div className="header-actions flex items-center gap-4">
          <select
            value={i18n.language}
            onChange={switchLang}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="ro">RO</option>
            <option value="en">EN</option>
          </select>
          <div className="header-user">
            <span>{user?.full_name || user?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}