/**
 * PermissionService
 * Handles permission checks and access control
 */

import { supabase } from "@/api/supabaseClient"
import { UserPermission, Role, RolePermission, Permission } from "@/core/types"
import { MODULES, PERMISSIONS } from "@/core/constants"

class PermissionService {
  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      const { data, error } = await supabase
        .from("v_user_permissions")
        .select("user_id, module_code, permission_code")
        .eq("user_id", userId)

      if (error) {
        console.error("Error fetching user permissions:", error)
        return []
      }

      return (data as UserPermission[]) || []
    } catch (error) {
      console.error("Get user permissions error:", error)
      return []
    }
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("roles(*)")
        .eq("user_id", userId)

      if (error) {
        console.error("Error fetching user roles:", error)
        return []
      }

      return (data?.map((ur: any) => ur.roles) || []) as Role[]
    } catch (error) {
      console.error("Get user roles error:", error)
      return []
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(
    permissions: UserPermission[],
    moduleCode: string,
    permissionCode: string
  ): boolean {
    if (!Array.isArray(permissions)) {
      return false
    }

    const m = moduleCode.toLowerCase()
    const pcode = permissionCode.toLowerCase()

    return permissions.some(
      (p) =>
        p.module_code.toLowerCase() === m &&
        p.permission_code.toLowerCase() === pcode
    )
  }

  /**
   * Check if user can view a module
   */
  canView(permissions: UserPermission[], moduleCode: string): boolean {
    if (!Array.isArray(permissions)) {
      return false
    }

    const m = moduleCode.toLowerCase()
    return permissions.some((p) => p.module_code.toLowerCase() === m)
  }

  /**
   * Check if user can create in a module
   */
  canCreate(permissions: UserPermission[], moduleCode: string): boolean {
    return this.hasPermission(permissions, moduleCode, "create")
  }

  /**
   * Check if user can edit in a module
   */
  canEdit(permissions: UserPermission[], moduleCode: string): boolean {
    return this.hasPermission(permissions, moduleCode, "edit")
  }

  /**
   * Check if user can delete in a module
   */
  canDelete(permissions: UserPermission[], moduleCode: string): boolean {
    return this.hasPermission(permissions, moduleCode, "delete")
  }

  /**
   * Check if user can approve in a module
   */
  canApprove(permissions: UserPermission[], moduleCode: string): boolean {
    return this.hasPermission(permissions, moduleCode, "approve_leave")
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .eq("is_active", true)

      if (error) {
        console.error("Error fetching permissions:", error)
        return []
      }

      return (data as Permission[]) || []
    } catch (error) {
      console.error("Get all permissions error:", error)
      return []
    }
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("permissions(*)")
        .eq("role_id", roleId)

      if (error) {
        console.error("Error fetching role permissions:", error)
        return []
      }

      return (data?.map((rp: any) => rp.permissions) || []) as Permission[]
    } catch (error) {
      console.error("Get role permissions error:", error)
      return []
    }
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(
    roleId: string,
    permissionId: string
  ): Promise<RolePermission | null> {
    try {
      const { data, error } = await supabase
        .from("role_permissions")
        .insert({
          role_id: roleId,
          permission_id: permissionId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error assigning permission to role:", error)
        return null
      }

      return data as RolePermission
    } catch (error) {
      console.error("Assign permission to role error:", error)
      return null
    }
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", roleId)
        .eq("permission_id", permissionId)

      if (error) {
        console.error("Error removing permission from role:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Remove permission from role error:", error)
      return false
    }
  }

  /**
   * Check if user has any of multiple permissions
   */
  hasAnyPermission(
    permissions: UserPermission[],
    moduleCode: string,
    permissionCodes: string[]
  ): boolean {
    return permissionCodes.some((pc) =>
      this.hasPermission(permissions, moduleCode, pc)
    )
  }

  /**
   * Get permission matrix for a module
   */
  getModulePermissions(
    permissions: UserPermission[],
    moduleCode: string
  ): {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  } {
    return {
      view: this.canView(permissions, moduleCode),
      create: this.canCreate(permissions, moduleCode),
      edit: this.canEdit(permissions, moduleCode),
      delete: this.canDelete(permissions, moduleCode),
    }
  }
}

export const permissionService = new PermissionService()
export default PermissionService
