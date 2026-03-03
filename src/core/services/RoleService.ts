/**
 * RoleService
 * Handles role management, assignment, and queries
 */

import { supabase } from "@/api/supabaseClient"
import { Role, UserRole, RolePermission } from "@/core/types"

class RoleService {
  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("Error fetching roles:", error)
        return []
      }

      return (data as Role[]) || []
    } catch (error) {
      console.error("Get all roles error:", error)
      return []
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", roleId)
        .single()

      if (error) {
        console.error("Error fetching role:", error)
        return null
      }

      return data as Role
    } catch (error) {
      console.error("Get role by ID error:", error)
      return null
    }
  }

  /**
   * Get role by code
   */
  async getRoleByCode(roleCode: string): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("code", roleCode)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error fetching role by code:", error)
        return null
      }

      return data as Role
    } catch (error) {
      console.error("Get role by code error:", error)
      return null
    }
  }

  /**
   * Create new role
   */
  async createRole(role: Omit<Role, "id" | "created_at" | "updated_at">): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from("roles")
        .insert(role)
        .select()
        .single()

      if (error) {
        console.error("Error creating role:", error)
        return null
      }

      return data as Role
    } catch (error) {
      console.error("Create role error:", error)
      return null
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from("roles")
        .update(updates)
        .eq("id", roleId)
        .select()
        .single()

      if (error) {
        console.error("Error updating role:", error)
        return null
      }

      return data as Role
    } catch (error) {
      console.error("Update role error:", error)
      return null
    }
  }

  /**
   * Delete role (soft delete via is_active)
   */
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("roles")
        .update({ is_active: false })
        .eq("id", roleId)

      if (error) {
        console.error("Error deleting role:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Delete role error:", error)
      return false
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<UserRole | null> {
    try {
      // Check if assignment already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role_id", roleId)
        .single()

      if (existing) {
        return existing as UserRole
      }

      // Create new assignment
      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role_id: roleId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error assigning role to user:", error)
        return null
      }

      return data as UserRole
    } catch (error) {
      console.error("Assign role to user error:", error)
      return null
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role_id", roleId)

      if (error) {
        console.error("Error removing role from user:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Remove role from user error:", error)
      return false
    }
  }

  /**
   * Get user roles count
   */
  async getUserRoleCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("roles.is_active", true)

      if (error) {
        console.error("Error counting user roles:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Get user role count error:", error)
      return 0
    }
  }

  /**
   * Get role usage count
   */
  async getRoleUsageCount(roleId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role_id", roleId)

      if (error) {
        console.error("Error counting role usage:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Get role usage count error:", error)
      return 0
    }
  }

  /**
   * Check if role is assigned to any user
   */
  async isRoleInUse(roleId: string): Promise<boolean> {
    const count = await this.getRoleUsageCount(roleId)
    return count > 0
  }

  /**
   * Get all users with a specific role
   */
  async getUsersByRole(roleId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role_id", roleId)

      if (error) {
        console.error("Error fetching users by role:", error)
        return []
      }

      return (data?.map((ur) => ur.user_id) || []) as string[]
    } catch (error) {
      console.error("Get users by role error:", error)
      return []
    }
  }

  /**
   * Bulk assign role to multiple users
   */
  async bulkAssignRole(userIds: string[], roleId: string): Promise<number> {
    try {
      const assignments = userIds.map((userId) => ({
        user_id: userId,
        role_id: roleId,
      }))

      const { data, error } = await supabase
        .from("user_roles")
        .insert(assignments, { ignoreDuplicates: true })

      if (error) {
        console.error("Error bulk assigning role:", error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error("Bulk assign role error:", error)
      return 0
    }
  }

  /**
   * Bulk remove role from multiple users
   */
  async bulkRemoveRole(userIds: string[], roleId: string): Promise<number> {
    try {
      let removed = 0

      for (const userId of userIds) {
        const success = await this.removeRoleFromUser(userId, roleId)
        if (success) removed++
      }

      return removed
    } catch (error) {
      console.error("Bulk remove role error:", error)
      return 0
    }
  }
}

export const roleService = new RoleService()
export default RoleService
