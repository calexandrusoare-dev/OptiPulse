/**
 * OptiPulse HR - Leave Planning Module
 * Manage leave schedules and team planning
 */

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import { supabase } from "../../api/supabaseClient"
import { canCreate, canEdit } from "../../lib/rbac"
import { LeaveRequest } from "../../types"

export default function LeavePlanning() {
  const { permissions } = useAuth()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all")

  const moduleCode = "hr"
  const canManage = canEdit(permissions, moduleCode)

  /**
   * Load approved leave requests for planning view
   */
  const loadPlanning = async () => {
    try {
      setError(null)
      setLoading(true)

      let query = supabase
        .from("leave_requests")
        .select("*")
        .order("start_date", { ascending: true })

      if (filter === "approved") {
        query = query.eq("status", "approved")
      } else if (filter === "pending") {
        query = query.eq("status", "pending")
      }

      const { data, error: err } = await query

      if (err) throw err

      setRequests((data as LeaveRequest[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load planning")
      console.error("Load error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlanning()
  }, [filter])

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected",
    }
    return statusMap[status] || ""
  }

  return (
    <div>
      <div className="content-header">
        <h2 className="content-title">Leave Planning</h2>
        <div className="content-actions">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "approved" | "pending")
            }
            style={{ padding: "8px 12px" }}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading"></div>}

      {!loading && requests.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3 className="empty-state-title">No leave planned</h3>
          <p className="empty-state-description">
            No leave requests found for the selected filter
          </p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Leave Type</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.employee_id}</td>
                  <td>{req.start_date}</td>
                  <td>{req.end_date}</td>
                  <td>{req.days} days</td>
                  <td>{req.leave_type_id}</td>
                  <td>
                    <span className={`table-status ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "var(--gray-50)",
          borderRadius: "8px",
          fontSize: "14px",
          color: "var(--gray-600)",
        }}
      >
        <strong>Note:</strong> This view displays all leave requests to help with
        team planning. Approved requests are prioritized in scheduling.
      </div>
    </div>
  )
}