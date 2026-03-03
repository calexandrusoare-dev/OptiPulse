/**
 * AuditService
 * Handles audit logging for compliance and security
 */

import { supabase } from "@/api/supabaseClient"
import { AuditLog } from "@/core/types"
import { AUDIT_ACTIONS, PAGINATION } from "@/core/constants"

class AuditService {
  /**
   * Log user action to audit trail
   */
  async logAction(
    userId: string,
    action: keyof typeof AUDIT_ACTIONS,
    tableName: string,
    recordId: string,
    details?: {
      oldValue?: Record<string, any>
      newValue?: Record<string, any>
      description?: string
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<AuditLog | null> {
    try {
      const logData = {
        user_id: userId,
        action: AUDIT_ACTIONS[action],
        table_name: tableName,
        record_id: recordId,
        old_value: details?.oldValue || null,
        new_value: details?.newValue || null,
        details: details?.description || null,
        ip_address: details?.ipAddress || null,
        user_agent: details?.userAgent || null,
      }

      const { data, error } = await supabase
        .from("audit_logs")
        .insert(logData)
        .select()
        .single()

      if (error) {
        console.error("Error logging audit action:", error)
        return null
      }

      return data as AuditLog
    } catch (error) {
      console.error("Log action error:", error)
      return null
    }
  }

  /**
   * Get audit logs with optional filtering
   */
  async getAuditLogs(
    filters?: {
      userId?: string
      tableName?: string
      action?: string
      recordId?: string
      startDate?: string
      endDate?: string
      page?: number
      pageSize?: number
    }
  ): Promise<{
    logs: AuditLog[]
    total: number
    page: number
    pageSize: number
  }> {
    try {
      const page = filters?.page || PAGINATION.DEFAULT_PAGE
      const pageSize = Math.min(
        filters?.pageSize || PAGINATION.DEFAULT_PAGE_SIZE,
        PAGINATION.MAX_PAGE_SIZE
      )
      const offset = (page - 1) * pageSize

      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId)
      }

      if (filters?.tableName) {
        query = query.eq("table_name", filters.tableName)
      }

      if (filters?.action) {
        query = query.eq("action", filters.action)
      }

      if (filters?.recordId) {
        query = query.eq("record_id", filters.recordId)
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate)
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (error) {
        console.error("Error fetching audit logs:", error)
        return { logs: [], total: 0, page, pageSize }
      }

      return {
        logs: (data || []) as AuditLog[],
        total: count || 0,
        page,
        pageSize,
      }
    } catch (error) {
      console.error("Get audit logs error:", error)
      return { logs: [], total: 0, page: 1, pageSize: PAGINATION.DEFAULT_PAGE_SIZE }
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching recent activity:", error)
        return []
      }

      return (data || []) as AuditLog[]
    } catch (error) {
      console.error("Get recent activity error:", error)
      return []
    }
  }

  /**
   * Get user activity
   */
  async getUserActivity(
    userId: string,
    limit: number = 20
  ): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching user activity:", error)
        return []
      }

      return (data || []) as AuditLog[]
    } catch (error) {
      console.error("Get user activity error:", error)
      return []
    }
  }

  /**
   * Get activity report by date range
   */
  async getActivityReport(startDate: string, endDate: string): Promise<{
    totalActions: number
    actionsByType: Record<string, number>
    actionsByUser: Record<string, number>
    actionsByTable: Record<string, number>
  }> {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)

      if (error) {
        console.error("Error fetching activity report:", error)
        return {
          totalActions: 0,
          actionsByType: {},
          actionsByUser: {},
          actionsByTable: {},
        }
      }

      const logs = (data || []) as AuditLog[]
      const report = {
        totalActions: logs.length,
        actionsByType: {} as Record<string, number>,
        actionsByUser: {} as Record<string, number>,
        actionsByTable: {} as Record<string, number>,
      }

      logs.forEach((log) => {
        // Count by action type
        report.actionsByType[log.action] =
          (report.actionsByType[log.action] || 0) + 1

        // Count by user
        report.actionsByUser[log.user_id] =
          (report.actionsByUser[log.user_id] || 0) + 1

        // Count by table
        report.actionsByTable[log.table_name] =
          (report.actionsByTable[log.table_name] || 0) + 1
      })

      return report
    } catch (error) {
      console.error("Get activity report error:", error)
      return {
        totalActions: 0,
        actionsByType: {},
        actionsByUser: {},
        actionsByTable: {},
      }
    }
  }

  /**
   * Check for suspicious activity pattern
   */
  async checkSuspiciousActivity(
    userId: string,
    timeWindowMs: number = 60000
  ): Promise<boolean> {
    try {
      const now = new Date()
      const startTime = new Date(now.getTime() - timeWindowMs)

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("action", "LOGIN")
        .gte("created_at", startTime.toISOString())

      if (error) {
        console.error("Error checking suspicious activity:", error)
        return false
      }

      // Flag as suspicious if too many login attempts
      return (data?.length || 0) > 5
    } catch (error) {
      console.error("Check suspicious activity error:", error)
      return false
    }
  }

  /**
   * Export audit logs to CSV format
   */
  exportToCSV(logs: AuditLog[]): string {
    const headers = [
      "ID",
      "User ID",
      "Action",
      "Table",
      "Record ID",
      "Timestamp",
      "Details",
    ]
    const rows = logs.map((log) => [
      log.id,
      log.user_id,
      log.action,
      log.table_name,
      log.record_id,
      new Date(log.created_at).toISOString(),
      log.details || "",
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    return csv
  }
}

export const auditService = new AuditService()
export default AuditService
