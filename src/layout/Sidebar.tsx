import { Link } from "react-router-dom"
import { supabase } from "../api/supabaseClient"

export default function Sidebar() {
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <aside className="sidebar">
      <h2>OptiPulse</h2>

      <nav>
        <Link to="/hr/leave-requests">Leave Requests</Link>
        <Link to="/hr/leave-planning">Leave Planning</Link>
        <Link to="/finance/expenses">Expenses</Link>
        <Link to="/admin/users">Users</Link>
      </nav>

      <button onClick={handleLogout}>Logout</button>
    </aside>
  )
}