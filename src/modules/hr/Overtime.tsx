/**
 * OptiPulse HR - Overtime Module
 * Track and manage employee overtime
 */

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import { supabase } from "../../api/supabaseClient"
import { canCreate, canApprove } from "../../lib/rbac"

interface OvertimeRecord {
  id: string
  employee_id: string
  date: string
  hours: number
  reason: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function Overtime() {
  const { user, permissions } = useAuth()
  const [records, setRecords] = useState<OvertimeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const moduleCode = "hr"
  const canCreateOvertime = canCreate(permissions, moduleCode)
  const canApproveOvertime = canApprove(permissions, moduleCode)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: 1,
    reason: "",
  })

  const loadRecords = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: err } = await supabase
        .from("overtime_records")
        .select("*")
        .order("date", { ascending: false })

      if (err) throw err

      setRecords((data as OvertimeRecord[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      setError("User not authenticated")
      return
    }

    try {
      setError(null)

      const { error: err } = await supabase.from("overtime_records").insert({
        employee_id: user.id,
        date: formData.date,
        hours: formData.hours,
        reason: formData.reason,
        status: "pending",
      })

      if (err) throw err

      setFormData({
        date: new Date().toISOString().split("T")[0],
        hours: 1,
        reason: "",
      })
      setShowForm(false)
      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record")
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("overtime_records")
        .update({ status: "approved" })
        .eq("id", id)

      if (err) throw err
      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve")
    }
  }

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected",
    }
    return map[status] || ""
  }

  return (
    <div>
      <div className="content-header">
        <h2 className="content-title">Overtime</h2>
        <div className="content-actions">
          {canCreateOvertime && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Log Overtime"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && canCreateOvertime && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>Log Overtime</h3>
          <form onSubmit={handleCreate} className="login-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Why overtime was needed..."
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Log Overtime
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="loading"></div>}

      {!loading && records.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">⏰</div>
          <h3 className="empty-state-title">No overtime records</h3>
          <p className="empty-state-description">
            {canCreateOvertime ? "Log your first overtime hour" : "No records yet"}
          </p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Hours</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.hours}h</td>
                  <td>{r.reason || "-"}</td>
                  <td>
                    <span className={`table-status ${getStatusClass(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === "pending" && canApproveOvertime && (
                      <button
                        className="btn-success btn-small"
                        onClick={() => handleApprove(r.id)}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
