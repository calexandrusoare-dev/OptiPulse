/**
 * OptiPulse HR - Leave Requests Module
 * Manage leave request lifecycle with RBAC
 */

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import { supabase } from "../../api/supabaseClient"
import {
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  hasPermission,
} from "../../lib/rbac"
import { LeaveRequest } from "../../types"

export default function LeaveRequests() {
  const { user, permissions } = useAuth()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    leave_type_id: "vacation",
    reason: "",
  })

  const moduleCode = "hr"

  // Permission checks
  const canCreateRequest = canCreate(permissions, moduleCode)
  const canApproveRequests = canApprove(permissions, moduleCode)
  const canEditRequest = canEdit(permissions, moduleCode)
  const canDeleteRequest = canDelete(permissions, moduleCode)

  /**
   * Load leave requests
   */
  const loadRequests = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: err } = await supabase
        .from("leave_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (err) throw err

      setRequests((data as LeaveRequest[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests")
      console.error("Load error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  /**
   * Create new leave request
   */
  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      setError("User not authenticated")
      return
    }

    if (!formData.start_date || !formData.end_date) {
      setError("Please fill in all required fields")
      return
    }

    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)

    if (startDate > endDate) {
      setError("Start date must be before end date")
      return
    }

    try {
      setError(null)
      setLoading(true)

      // Calculate working days
      const days =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

      const { error: err } = await supabase.from("leave_requests").insert({
        employee_id: user.id,
        leave_type_id: formData.leave_type_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days,
        reason: formData.reason,
        status: "pending",
      })

      if (err) throw err

      setFormData({
        start_date: "",
        end_date: "",
        leave_type_id: "vacation",
        reason: "",
      })
      setShowForm(false)
      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create request")
      console.error("Create error:", err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Approve leave request
   */
  const handleApprove = async (requestId: string) => {
    if (!canApproveRequests) {
      setError("You don't have permission to approve requests")
      return
    }

    try {
      setError(null)

      const { error: err } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (err) throw err

      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request")
    }
  }

  /**
   * Reject leave request
   */
  const handleReject = async (requestId: string) => {
    if (!canApproveRequests) {
      setError("You don't have permission to reject requests")
      return
    }

    try {
      setError(null)

      const { error: err } = await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (err) throw err

      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request")
    }
  }

  /**
   * Delete leave request
   */
  const handleDelete = async (requestId: string) => {
    if (!canDeleteRequest) {
      setError("You don't have permission to delete requests")
      return
    }

    if (!window.confirm("Are you sure you want to delete this request?")) {
      return
    }

    try {
      setError(null)

      const { error: err } = await supabase
        .from("leave_requests")
        .delete()
        .eq("id", requestId)

      if (err) throw err

      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete request")
    }
  }

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
        <h2 className="content-title">Leave Requests</h2>
        <div className="content-actions">
          {canCreateRequest && (
            <button
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "+ New Request"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && canCreateRequest && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>New Leave Request</h3>
          <form onSubmit={handleCreateRequest} className="login-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select
                value={formData.leave_type_id}
                onChange={(e) =>
                  setFormData({ ...formData, leave_type_id: e.target.value })
                }
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Optional reason for leave..."
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
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="loading"></div>}

      {!loading && requests.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No leave requests</h3>
          <p className="empty-state-description">
            {canCreateRequest
              ? "Create your first leave request to get started"
              : "You don't have any leave requests yet"}
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
                <th>Days</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.employee_id}</td>
                  <td>{req.start_date}</td>
                  <td>{req.end_date}</td>
                  <td>{req.days}</td>
                  <td>{req.leave_type_id}</td>
                  <td>
                    <span className={`table-status ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === "pending" && canApproveRequests && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-success btn-small"
                          onClick={() => handleApprove(req.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleReject(req.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {canDeleteRequest && (
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleDelete(req.id)}
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