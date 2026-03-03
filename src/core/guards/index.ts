/**
 * Permission Guards
 * Middleware for access control based on permissions and roles
 */

import { UserPermission, Role } from "@/core/types"

/**
 * Guard: Check if user has permission
 */
export function guardHasPermission(
  permissions: UserPermission[],
  moduleCode: string,
  permissionCode: string
): boolean {
  const m = moduleCode.toLowerCase()
  const pcode = permissionCode.toLowerCase()

  return permissions.some(
    (p: UserPermission) =>
      p.module_code.toLowerCase() === m &&
      p.permission_code.toLowerCase() === pcode
  )
}

/**
 * Guard: Check if user has any of the specified permissions
 */
export function guardHasAnyPermission(
  permissions: UserPermission[],
  moduleCode: string,
  permissionCodes: string[]
): boolean {
  return permissionCodes.some((pc) =>
    guardHasPermission(permissions, moduleCode, pc)
  )
}

/**
 * Guard: Check if user has all of the specified permissions
 */
export function guardHasAllPermissions(
  permissions: UserPermission[],
  moduleCode: string,
  permissionCodes: string[]
): boolean {
  return permissionCodes.every((pc) =>
    guardHasPermission(permissions, moduleCode, pc)
  )
}

/**
 * Guard: Check if user has role
 */
export function guardHasRole(roles: Role[] | string[], roleCode: string): boolean {
  const roleCodes = Array.isArray(roles)
    ? roles.some((r) => typeof r === "string" ? r : (r as any).code)
      ? roles.map((r) => (typeof r === "string" ? r : (r as any).code))
      : roles.map((r) => (r as any).code || r)
    : []

  return roleCodes.some((rc: any) => rc.toLowerCase() === roleCode.toLowerCase())
}

/**
 * Guard: Check if user is admin
 */
export function guardIsAdmin(roles: Role[] | string[]): boolean {
  return guardHasRole(roles, "admin") || guardHasRole(roles, "super_admin")
}

/**
 * Guard: Check if user is super admin
 */
export function guardIsSuperAdmin(roles: Role[] | string[]): boolean {
  return guardHasRole(roles, "super_admin")
}

/**
 * Guard: Can view module
 */
export function guardCanViewModule(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  const m = moduleCode.toLowerCase()
  return permissions.some((p: UserPermission) => p.module_code.toLowerCase() === m)
}

/**
 * Guard: Can create
 */
export function guardCanCreate(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  return guardHasPermission(permissions, moduleCode, "create")
}

/**
 * Guard: Can edit
 */
export function guardCanEdit(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  return guardHasPermission(permissions, moduleCode, "edit")
}

/**
 * Guard: Can delete
 */
export function guardCanDelete(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  return guardHasPermission(permissions, moduleCode, "delete")
}

/**
 * Guard: Can approve
 */
export function guardCanApprove(
  permissions: UserPermission[],
  moduleCode: string
): boolean {
  const approvePermCode = `${moduleCode.toLowerCase()}_approve`
  return guardHasPermission(permissions, moduleCode, approvePermCode)
}

/**
 * Guard: Enforce access or throw error
 */
export function guardEnforceAccess(
  permissions: UserPermission[],
  moduleCode: string,
  permissionCode: string,
  errorMessage: string = "Access denied"
): void {
  if (!guardHasPermission(permissions, moduleCode, permissionCode)) {
    throw new Error(errorMessage)
  }
}

/**
 * Guard: Enforce admin access
 */
export function guardEnforceAdmin(
  roles: Role[] | string[],
  errorMessage: string = "Admin access required"
): void {
  if (!guardIsAdmin(roles)) {
    throw new Error(errorMessage)
  }
}

/**
 * Guard: Enforce super admin access
 */
export function guardEnforceSuperAdmin(
  roles: Role[] | string[],
  errorMessage: string = "Super admin access required"
): void {
  if (!guardIsSuperAdmin(roles)) {
    throw new Error(errorMessage)
  }
}

/**
 * Guard: Get permission level
 */
export enum PermissionLevel {
  NONE = 0,
  VIEW = 1,
  CREATE = 2,
  EDIT = 3,
  DELETE = 4,
}

export function guardGetPermissionLevel(
  permissions: UserPermission[],
  moduleCode: string
): PermissionLevel {
  if (!guardCanViewModule(permissions, moduleCode)) {
    return PermissionLevel.NONE
  }
  if (guardCanDelete(permissions, moduleCode)) {
    return PermissionLevel.DELETE
  }
  if (guardCanEdit(permissions, moduleCode)) {
    return PermissionLevel.EDIT
  }
  if (guardCanCreate(permissions, moduleCode)) {
    return PermissionLevel.CREATE
  }
  return PermissionLevel.VIEW
}
