/**
 * OptiPulse - RBAC Utilities
 * Permission checking and access control helpers
 */

import { UserPermission, PermissionCheckParams } from "../types"

/**
 * Check if user has specific permission
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @param permissionCode Permission code to check
 * @returns true if user has permission
 */
export function hasPermission(
  permissions: UserPermission[],
  moduleCode: string,
  permissionCode: string
): boolean {
  if (!Array.isArray(permissions)) {
    return false
  }

  return permissions.some(
    (p) =>
      p.module_code === moduleCode && p.permission_code === permissionCode
  )
}

/**
 * Check if user has view permission for module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user can view module
 */
export function canView(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  if (!Array.isArray(permissions)) {
    return false
  }

  return permissions.some((p) => p.module_code === moduleCode)
}

/**
 * Check if user can create in a module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user has create permission
 */
export function canCreate(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  return hasPermission(permissions, moduleCode, "create")
}

/**
 * Check if user can edit in a module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user has edit permission
 */
export function canEdit(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  return hasPermission(permissions, moduleCode, "edit")
}

/**
 * Check if user can delete in a module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user has delete permission
 */
export function canDelete(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  return hasPermission(permissions, moduleCode, "delete")
}

/**
 * Check if user can approve in a module
 * @param permissions User permissions array
 * @param moduleCode Module code to check
 * @returns true if user has approve permission
 */
export function canApprove(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  return hasPermission(permissions, moduleCode, "approve")
}

/**
 * Get all modules user has access to
 * @param permissions User permissions array
 * @returns Array of unique module codes
 */
export function getUserModules(permissions: UserPermission[]): string[] {
  if (!Array.isArray(permissions)) {
    return []
  }

  const modules = new Set(permissions.map((p) => p.module_code))
  return Array.from(modules)
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
  if (!Array.isArray(permissions)) {
    return []
  }

  return permissions
    .filter((p) => p.module_code === moduleCode)
    .map((p) => p.permission_code)
}

/**
 * Check multiple permission conditions (OR logic)
 * @param permissions User permissions array
 * @param conditions Array of module-permission pairs
 * @returns true if user has ANY of the permissions
 */
export function hasAnyPermission(
  permissions: UserPermission[],
  conditions: PermissionCheckParams[]
): boolean {
  return conditions.some((condition) =>
    hasPermission(permissions, condition.moduleCode, condition.permissionCode)
  )
}

/**
 * Check multiple permission conditions (AND logic)
 * @param permissions User permissions array
 * @param conditions Array of module-permission pairs
 * @returns true if user has ALL of the permissions
 */
export function hasAllPermissions(
  permissions: UserPermission[],
  conditions: PermissionCheckParams[]
): boolean {
  return conditions.every((condition) =>
    hasPermission(permissions, condition.moduleCode, condition.permissionCode)
  )
}

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
    if (!matrix[p.module_code]) {
      matrix[p.module_code] = []
    }
    if (!matrix[p.module_code].includes(p.permission_code)) {
      matrix[p.module_code].push(p.permission_code)
    }
  })

  return matrix
}
