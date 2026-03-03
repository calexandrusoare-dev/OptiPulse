/**
 * OptiPulse - RBAC Utilities
 * Permission checking and access control helpers
 */

import { UserPermission, PermissionCheckParams } from "@/core/types"
import {
  guardHasPermission,
  guardCanViewModule,
  guardCanCreate,
  guardCanEdit,
  guardCanDelete,
  guardCanApprove,
  guardHasAnyPermission,
  guardHasAllPermissions,
  guardEnforceAccess,
  guardHasRole,
  guardIsAdmin,
  guardIsSuperAdmin,
} from "@/core/guards"

/**
 * Check if user has specific permission
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @param permissionCode Permission code to check
 * @returns true if user has permission
 */
export const hasPermission = guardHasPermission

/**
 * Check if user has view permission for module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user can view module
 */
export const canView = guardCanViewModule

/**
 * Check if user can create in a module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user has create permission
 */
export const canCreate = guardCanCreate

/**
 * Check if user can edit in a module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user has edit permission
 */
export const canEdit = guardCanEdit

/**
 * Check if user can delete in a module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user has delete permission
 */
export const canDelete = guardCanDelete

/**
 * Check if user can approve in a module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user has approve permission
 */
export const canApprove = guardCanApprove

/**
 * Get all modules user has access to
 * @param permissions User permissions array
 * @returns Array of unique module codes
 */
export function getUserModules(permissions: UserPermission[]): string[] {
  if (!Array.isArray(permissions)) return []
  return Array.from(
    new Set(permissions.map((p) => p.module_code.toLowerCase()))
  )
}

/**
 * Get all permissions for a specific module
 * @param permissions User permissions array
 * @param moduleCode Module code to filter
 * @returns Array of permission codes for the module
 */
export function getModulePermissions(
  permissions: UserPermission[],
  moduleCode: string
): string[] {
  if (!Array.isArray(permissions)) return []
  const m = moduleCode.toLowerCase()
  return permissions
    .filter((p) => p.module_code.toLowerCase() === m)
    .map((p) => p.permission_code)
}

/**
 * Check multiple permission conditions (OR logic)
 * @param permissions User permissions array
 * @param conditions Array of module-permission pairs
 * @returns true if user has ANY of the permissions
 */
export const hasAnyPermission = guardHasAnyPermission

/**
 * Check multiple permission conditions (AND logic)
 * @param permissions User permissions array
 * @param conditions Array of module-permission pairs
 * @returns true if user has ALL of the permissions
 */
export const hasAllPermissions = guardHasAllPermissions

/**
 * Module access check
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @param requiredPermission Optional specific permission to check
 * @returns boolean
 */
export function hasModuleAccess(
  permissions: UserPermission[],
  moduleCode: string,
  requiredPermission?: string
): boolean {
  if (requiredPermission) {
    return hasPermission(permissions, moduleCode, requiredPermission)
  }
  return canView(permissions, moduleCode)
}

/**
 * Get permission metadata for display
 * @param permissions User permissions array
 * @returns Object with module codes as keys and permissions arrays as values
 */
export function getPermissionMatrix(
  permissions: UserPermission[]
): Record<string, string[]> {
  const matrix: Record<string, string[]> = {}

  permissions.forEach((p) => {
    const module = p.module_code.toLowerCase()
    if (!matrix[module]) {
      matrix[module] = []
    }
    const perm = p.permission_code.toLowerCase()
    if (!matrix[module].includes(perm)) {
      matrix[module].push(perm)
    }
  })

  return matrix
}
