import { Outlet, Link, useNavigate } from "react-router-dom"
import { supabase } from "../api/supabaseClient"
import { useAuth } from "../auth/AuthProvider"

export default function MainLayout() {
  const { permissions } = useAuth()
  const navigate = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const hasModule = (module: string) =>
    permissions.some(p => p.module === module)

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "250px",
          background: "#1f2937",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>OptiPulse</h2>

        {hasModule("hr") && (
          <div>
            <Link to="/hr/leave-requests" style={{ color: "white" }}>
              Concedii
            </Link>
          </div>
        )}

        {hasModule("finance") && (
          <div>
            <Link to="/finance/expenses" style={{ color: "white" }}>
              Cheltuieli
            </Link>
          </div>
        )}

        {hasModule("admin") && (
          <div>
            <Link to="/admin/users" style={{ color: "white" }}>
              Utilizatori
            </Link>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            marginTop: "20px",
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: "30px", background: "#f3f4f6" }}>
        <Outlet />
      </main>
    </div>
  )
}