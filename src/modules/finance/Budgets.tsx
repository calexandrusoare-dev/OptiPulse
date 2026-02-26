/**
 * OptiPulse Finance - Budgets Module
 * Department budget allocation and tracking
 */

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import { supabase } from "../../api/supabaseClient"
import { canCreate, canEdit } from "../../lib/rbac"
import { Budget } from "../../types"

export default function Budgets() {
  const { permissions } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const moduleCode = "finance"
  const canManageBudgets = canEdit(permissions, moduleCode)

  const loadBudgets = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: err } = await supabase
        .from("budgets")
        .select("*")
        .order("fiscal_year", { ascending: false })

      if (err) throw err

      setBudgets((data as Budget[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budgets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudgets()
  }, [])

  const getPercentageUsed = (budget: Budget): number => {
    if (budget.allocated_amount === 0) return 0
    return (budget.spent_amount / budget.allocated_amount) * 100
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage < 50) return "#16a34a"
    if (percentage < 80) return "#ea580c"
    return "#dc2626"
  }

  return (
    <div>
      <div className="content-header">
        <h2 className="content-title">Department Budgets</h2>
        <div className="content-actions">
          {canManageBudgets && (
            <button className="btn-primary">+ New Budget</button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading"></div>}

      {!loading && budgets.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No budgets set</h3>
          <p className="empty-state-description">
            Create budgets for your departments
          </p>
        </div>
      )}

      {!loading && budgets.length > 0 && (
        <div style={{ display: "grid", gap: "20px" }}>
          {budgets.map((budget) => {
            const percentageUsed = getPercentageUsed(budget)
            const color = getProgressColor(percentageUsed)

            return (
              <div key={budget.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h4>{budget.department}</h4>
                  <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>
                    FY {budget.fiscal_year}
                  </span>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span>Allocated: ${budget.allocated_amount.toLocaleString()}</span>
                    <span>Used: ${budget.spent_amount.toLocaleString()}</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "var(--gray-200)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(percentageUsed, 100)}%`,
                        height: "100%",
                        backgroundColor: color,
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "var(--gray-600)",
                    }}
                  >
                    {percentageUsed.toFixed(1)}% used • ${budget.remaining_amount.toLocaleString()} remaining
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
