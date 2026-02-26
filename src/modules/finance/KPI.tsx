/**
 * OptiPulse Finance - KPI Dashboard
 * Key Performance Indicators and metrics tracking
 */

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import { supabase } from "../../api/supabaseClient"
import { canCreate, canEdit } from "../../lib/rbac"
import { KPI } from "../../types"

export default function KPIDashboard() {
  const { permissions } = useAuth()
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const moduleCode = "finance"
  const canManageKpi = canEdit(permissions, moduleCode)

  const loadKpis = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: err } = await supabase
        .from("kpis")
        .select("*")
        .order("period", { ascending: false })

      if (err) throw err

      setKpis((data as KPI[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KPIs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKpis()
  }, [])

  const getMetricStatus = (actual: number, target: number) => {
    if (actual >= target) return { text: "On Target", color: "var(--success-color)" }
    if (actual >= target * 0.8) return { text: "Warning", color: "var(--warning-color)" }
    return { text: "Behind", color: "var(--error-color)" }
  }

  const getProgressPercentage = (actual: number, target: number) => {
    if (target === 0) return 0
    return (actual / target) * 100
  }

  return (
    <div>
      <div className="content-header">
        <h2 className="content-title">Key Performance Indicators</h2>
        <div className="content-actions">
          {canManageKpi && (
            <button className="btn-primary">+ Add KPI</button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading"></div>}

      {!loading && kpis.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📈</div>
          <h3 className="empty-state-title">No KPIs defined</h3>
          <p className="empty-state-description">
            Create KPIs to track performance metrics
          </p>
        </div>
      )}

      {!loading && kpis.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {kpis.map((kpi) => {
            const percentage = getProgressPercentage(kpi.actual, kpi.target)
            const status = getMetricStatus(kpi.actual, kpi.target)

            return (
              <div key={kpi.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <h4>{kpi.name}</h4>
                    <p style={{ fontSize: "12px", color: "var(--gray-500)" }}>
                      Period: {kpi.period}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: "4px",
                      backgroundColor: status.color + "20",
                      color: status.color,
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {status.text}
                  </div>
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
                    <span>
                      <strong>{kpi.actual}</strong> / {kpi.target} {kpi.unit}
                    </span>
                    <span>{percentage.toFixed(0)}%</span>
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
                        width: `${Math.min(percentage, 100)}%`,
                        height: "100%",
                        backgroundColor: status.color,
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                </div>

                {kpi.responsible_person && (
                  <p style={{ fontSize: "12px", color: "var(--gray-600)" }}>
                    <strong>Owner:</strong> {kpi.responsible_person}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
