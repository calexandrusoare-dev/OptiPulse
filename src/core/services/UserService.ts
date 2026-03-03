/**
 * UserService
 * Handles user CRUD operations and related queries
 */

import { supabase } from "@/api/supabaseClient"
import {
  User,
  BusinessUser,
  ApiResponse,
  PaginatedResponse,
} from "@/core/types"

class UserService {
  /**
   * Fetch users with optional pagination
   */
  async getUsers(
    page: number = 1,
    pageSize: number = 20,
    search?: string
  ): Promise<PaginatedResponse<BusinessUser>> {
    try {
      let query = supabase.from("users").select("*")

      if (search) {
        query = query.ilike("email", `%${search}%`).or(`full_name.ilike.%${search}%`)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query.range(from, to)
      if (error) {
        throw error
      }

      return {
        data: (data as BusinessUser[]) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }
  }

  /**
   * Update a user record
   */
  async updateUser(
    userId: string,
    updates: Partial<User>,
    actorId?: string // for audit logging
  ): Promise<User | null> {
    try {
      // fetch existing record for audit comparison if needed
      let oldRecord: User | null = null
      if (actorId) {
        const { data: existing } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single()
        oldRecord = (existing as User) || null
      }

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single()
      if (error) {
        throw error
      }
      const updated = data as User

      // audit log if actor provided
      if (actorId) {
        import("@/core/services")
          .then(({ auditService }) => {
            auditService.logAction(
              actorId,
              "UPDATE",
              "users",
              userId,
              {
                oldValue: oldRecord || undefined,
                newValue: updated,
              }
            )
          })
          .catch((e) => console.error("Audit log error:", e))
      }

      return updated
    } catch (error) {
      console.error("Error updating user:", error)
      return null
    }
  }

  /**
   * Soft-delete a user by marking is_active=false
   */
  async deactivateUser(userId: string, actorId?: string): Promise<boolean> {
    try {
      const { data: oldData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      const { error } = await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", userId)
      if (error) {
        throw error
      }

      if (actorId) {
        import("@/core/services")
          .then(({ auditService }) => {
            auditService.logAction(
              actorId,
              "DELETE",
              "users",
              userId,
              { oldValue: oldData || undefined }
            )
          })
          .catch((e) => console.error("Audit log error:", e))
      }

      return true
    } catch (error) {
      console.error("Error deactivating user:", error)
      return false
    }
  }

  /**
   * Reactivate a user
   */
  async activateUser(userId: string, actorId?: string): Promise<boolean> {
    try {
      const { data: oldData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      const { error } = await supabase
        .from("users")
        .update({ is_active: true })
        .eq("id", userId)
      if (error) {
        throw error
      }

      if (actorId) {
        import("@/core/services")
          .then(({ auditService }) => {
            auditService.logAction(
              actorId,
              "UPDATE",
              "users",
              userId,
              { oldValue: oldData || undefined }
            )
          })
          .catch((e) => console.error("Audit log error:", e))
      }

      return true
    } catch (error) {
      console.error("Error activating user:", error)
      return false
    }
  }

  /**
   * Add permission override for a user
   */
  async setUserPermissionOverride(
    userId: string,
    moduleId: string,
    permissionId: string
  ) {
    // left as exercise / future - not implemented
  }
}

export const userService = new UserService()
export default UserService
