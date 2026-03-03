/**
 * useAudit Hook
 * Custom hook for audit logging
 */

import { useEffect, useState, useCallback } from "react"
import { auditService } from "@/core/services"
import { AuditLog } from "@/core/types"

/**
 * Hook to fetch audit logs
 */
export function useAuditLogs(filters?: {
  userId?: string
  tableName?: string
  action?: string
  recordId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setCurrentPage] = useState(filters?.page || 1)
  const [pageSize] = useState(filters?.pageSize || 20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await auditService.getAuditLogs({
        ...filters,
        page,
        pageSize,
      })
      setLogs(result.logs)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch audit logs")
    } finally {
      setLoading(false)
    }
  }, [filters, page, pageSize])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return {
    logs,
    total,
    page,
    setPage: setCurrentPage,
    pageSize,
    loading,
    error,
    refetch: fetchLogs,
  }
}

/**
 * Hook to fetch recent activity
 */
export function useRecentActivity(limit: number = 10) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await auditService.getRecentActivity(limit)
        setLogs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch activity")
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [limit])

  return { logs, loading, error }
}

/**
 * Hook to fetch user activity
 */
export function useUserActivity(userId: string, limit: number = 20) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchActivity = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await auditService.getUserActivity(userId, limit)
        setLogs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user activity")
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [userId, limit])

  return { logs, loading, error }
}

/**
 * Hook to log an action
 */
export function useLogAuditAction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const logAction = useCallback(
    async (
      userId: string,
      action: string,
      tableName: string,
      recordId: string,
      details?: {
        oldValue?: Record<string, any>
        newValue?: Record<string, any>
        description?: string
        ipAddress?: string
        userAgent?: string
      }
    ) => {
      try {
        setLoading(true)
        setError(null)
        const result = await auditService.logAction(
          userId,
          action as any,
          tableName,
          recordId,
          details
        )
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to log action"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { logAction, loading, error }
}

/**
 * Hook to fetch activity report
 */
export function useActivityReport(startDate: string, endDate: string) {
  const [report, setReport] = useState<{
    totalActions: number
    actionsByType: Record<string, number>
    actionsByUser: Record<string, number>
    actionsByTable: Record<string, number>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await auditService.getActivityReport(startDate, endDate)
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch report")
      } finally {
        setLoading(false)
      }
    }

    if (startDate && endDate) {
      fetchReport()
    }
  }, [startDate, endDate])

  return { report, loading, error }
}
