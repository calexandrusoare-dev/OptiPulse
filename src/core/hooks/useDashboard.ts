import { useState, useEffect } from "react"
import { supabase } from "@/api/supabaseClient"

interface DashboardStats {
  vacationDaysRemaining: string | number
  weeklyHours: string | number
  monthlyBudgetLeft: string | number
  pendingExpenses: number
}

interface PendingTask {
  id: string | number
  titleKey: string
  department?: string
  requester?: string
  days?: number
  amount?: string | number
  status?: string
}

export function useDashboardStats(userId?: string) {
  const [stats, setStats] = useState<DashboardStats>({
    vacationDaysRemaining: "-",
    weeklyHours: "-",
    monthlyBudgetLeft: "-",
    pendingExpenses: 0,
  })

  useEffect(() => {
    const load = async () => {
      try {
        // pending expenses count
        const { count: expCount, error: expErr } = await supabase
          .from("expense_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
        if (expErr) throw expErr

        // optional: get leave balance for user
        let balance: number | string = "-"
        if (userId) {
          const { data: balData, error: balErr } = await supabase
            .from("leave_balances")
            .select("balance")
            .eq("employee_id", userId)
            .single()
          if (!balErr && balData) {
            balance = balData.balance
          }
        }

        setStats((prev) => ({
          ...prev,
          pendingExpenses: expCount || 0,
          vacationDaysRemaining: balance,
        }))
      } catch (err) {
        console.error("Error loading dashboard stats:", err)
      }
    }
    load()
  }, [userId])

  return stats
}

export function usePendingTasks(limit: number = 5) {
  const [tasks, setTasks] = useState<PendingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [lrRes, expRes] = await Promise.all([
          supabase
            .from("leave_requests")
            .select("id,employee_id,dept,days,status")
            .eq("status", "pending")
            .limit(limit),
          supabase
            .from("expense_requests")
            .select(
              "id,employee_id,department,amount,status,description"
            )
            .eq("status", "pending")
            .limit(limit),
        ])

        const leaveTasks: PendingTask[] = (lrRes.data || []).map((l: any) => ({
          id: l.id,
          titleKey: "taskVacationApproval",
          department: l.dept || "HR",
          requester: l.employee_id,
          days: l.days,
          status: l.status,
        }))

        const expenseTasks: PendingTask[] = (expRes.data || []).map((e: any) => ({
          id: e.id,
          titleKey: "taskExpenseReview",
          department: e.department || "Finance",
          requester: e.employee_id,
          amount: e.amount,
          status: e.status,
        }))

        setTasks([...leaveTasks, ...expenseTasks])
      } catch (err) {
        console.error("Error loading pending tasks:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [limit])

  return { tasks, loading, error }
}
