/**
 * OptiPulse Finance - Expense Requests Module
 * Manage employee expense requests with RBAC
 */

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import { supabase } from "../../api/supabaseClient"
import {
  canCreate,
  canEdit,
  canDelete,
  canApprove,
} from "../../lib/rbac"
import { ExpenseRequest } from "../../types"

export default function ExpenseRequests() {
  const { user, permissions } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const moduleCode = "finance"

  const canCreateExpense = canCreate(permissions, moduleCode)
  const canApproveExpenses = canApprove(permissions, moduleCode)
  const canEditExpense = canEdit(permissions, moduleCode)
  const canDeleteExpense = canDelete(permissions, moduleCode)

  const [formData, setFormData] = useState({
    category: "travel",
    amount: 0,
    currency: "USD",
    description: "",
    receipt_url: "",
  })

  /**
   * Load expense requests
   */
  const loadExpenses = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: err } = await supabase
        .from("expense_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (err) throw err

      setExpenses((data as ExpenseRequest[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses")
      console.error("Load error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  /**
   * Create new expense request
   */
  const handleCreateExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      setError("User not authenticated")
      return
    }

    if (!formData.amount || formData.amount <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    try {
      setError(null)
      setLoading(true)

      const { error: err } = await supabase.from("expense_requests").insert({
        employee_id: user.id,
        category: formData.category,
        amount: formData.amount,
        currency: formData.currency,
        description: formData.description,
        receipt_url: formData.receipt_url || null,
        status: "pending",
      })

      if (err) throw err

      setFormData({
        category: "travel",
        amount: 0,
        currency: "USD",
        description: "",
        receipt_url: "",
      })
      setShowForm(false)
      await loadExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense")
      console.error("Create error:", err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Approve expense
   */
  const handleApprove = async (expenseId: string) => {
    if (!canApproveExpenses) {
      setError("You don't have permission to approve expenses")
      return
    }

    try {
      setError(null)

      const { error: err } = await supabase
        .from("expense_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", expenseId)

      if (err) throw err

      await loadExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve")
    }
  }

  /**
   * Reject expense
   */
  const handleReject = async (expenseId: string) => {
    if (!canApproveExpenses) {
      setError("You don't have permission to reject expenses")
      return
    }

    try {
      setError(null)

      const { error: err } = await supabase
        .from("expense_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", expenseId)

      if (err) throw err

      await loadExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject")
    }
  }

  /**
   * Delete expense
   */
  const handleDelete = async (expenseId: string) => {
    if (!canDeleteExpense) {
      setError("You don't have permission to delete expenses")
      return
    }

    if (!window.confirm("Delete this expense request?")) return

    try {
      setError(null)

      const { error: err } = await supabase
        .from("expense_requests")
        .delete()
        .eq("id", expenseId)

      if (err) throw err

      await loadExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected",
      reimbursed: "status-approved",
    }
    return map[status] || ""
  }

  return (
    <div>
      <div className="content-header">
        <h2 className="content-title">Expense Requests</h2>
        <div className="content-actions">
          {canCreateExpense && (
            <button
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "+ New Expense"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && canCreateExpense && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>New Expense Request</h3>
          <form onSubmit={handleCreateExpense} className="login-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="travel">Travel</option>
                  <option value="meals">Meals</option>
                  <option value="supplies">Supplies</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What was this expense for?"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Receipt URL</label>
              <input
                type="url"
                value={formData.receipt_url}
                onChange={(e) =>
                  setFormData({ ...formData, receipt_url: e.target.value })
                }
                placeholder="https://example.com/receipt.pdf"
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
                {loading ? "Creating..." : "Submit Expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="loading"></div>}

      {!loading && expenses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <h3 className="empty-state-title">No expenses</h3>
          <p className="empty-state-description">
            {canCreateExpense
              ? "Submit your first expense request"
              : "No expense requests yet"}
          </p>
        </div>
      )}

      {!loading && expenses.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.created_at ? new Date(exp.created_at).toLocaleDateString() : "-"}</td>
                  <td>{exp.category}</td>
                  <td>
                    {exp.amount} {exp.currency}
                  </td>
                  <td>{exp.description}</td>
                  <td>
                    <span
                      className={`table-status ${getStatusClass(exp.status)}`}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td>
                    {exp.status === "pending" && canApproveExpenses && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-success btn-small"
                          onClick={() => handleApprove(exp.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleReject(exp.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {canDeleteExpense && exp.status === "pending" && (
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleDelete(exp.id)}
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