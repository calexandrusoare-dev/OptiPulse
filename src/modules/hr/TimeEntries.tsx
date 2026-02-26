/**
 * OptiPulse HR - Time Entries Module
 * Track daily work hours and project assignments
 */

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import { supabase } from "../../api/supabaseClient"
import { canCreate, canEdit } from "../../lib/rbac"
import { TimeEntry } from "../../types"

export default function TimeEntries() {
  const { user, permissions } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const moduleCode = "hr"
  const canCreateEntry = canCreate(permissions, moduleCode)
  const canEditEntry = canEdit(permissions, moduleCode)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: 8,
    project_id: "general",
    description: "",
  })

  const loadEntries = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: err } = await supabase
        .from("time_entries")
        .select("*")
        .order("date", { ascending: false })
        .limit(30)

      if (err) throw err

      setEntries((data as TimeEntry[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      setError("User not authenticated")
      return
    }

    if (formData.hours < 0 || formData.hours > 24) {
      setError("Hours must be between 0 and 24")
      return
    }

    try {
      setError(null)

      const { error: err } = await supabase.from("time_entries").insert({
        employee_id: user.id,
        date: formData.date,
        hours: formData.hours,
        project_id: formData.project_id,
        description: formData.description,
      })

      if (err) throw err

      setFormData({
        date: new Date().toISOString().split("T")[0],
        hours: 8,
        project_id: "general",
        description: "",
      })
      setShowForm(false)
      await loadEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry")
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this entry?")) return

    try {
      const { error: err } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", id)

      if (err) throw err
      await loadEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const getTotalHours = () => {
    return entries.reduce((sum, e) => sum + e.hours, 0)
  }

  return (
    <div>
      <div className="content-header">
        <h2 className="content-title">Time Entries</h2>
        <div className="content-actions">
          {canCreateEntry && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Log Time"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && canCreateEntry && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>Log Time Entry</h3>
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
                  min="0"
                  max="24"
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
              <label className="form-label">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) =>
                  setFormData({ ...formData, project_id: e.target.value })
                }
              >
                <option value="general">General Work</option>
                <option value="project-a">Project A</option>
                <option value="project-b">Project B</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What did you work on?"
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
                Log Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: "20px",
            backgroundColor: "var(--primary-light)",
            borderRadius: "8px",
          }}
        >
          <strong>Total Hours (Last 30 Days):</strong> {getTotalHours().toFixed(1)}h
        </div>
      )}

      {loading && <div className="loading"></div>}

      {!loading && entries.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🕐</div>
          <h3 className="empty-state-title">No time entries</h3>
          <p className="empty-state-description">
            {canCreateEntry ? "Log your first time entry" : "No entries yet"}
          </p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Hours</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.project_id}</td>
                  <td>
                    <strong>{e.hours}h</strong>
                  </td>
                  <td>{e.description || "-"}</td>
                  <td>{e.created_at ? new Date(e.created_at).toLocaleDateString() : "-"}</td>
                  <td>
                    {canEditEntry && (
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleDelete(e.id)}
                      >
                        Delete
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
