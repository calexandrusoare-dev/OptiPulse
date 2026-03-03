/**
 * useAuth Hook
 * Custom hook for authentication and session management
 */

import { useContext, useCallback } from "react"
import { AuthContext } from "@/auth/AuthProvider"
import { AuthContextType } from "@/core/types"

/**
 * Custom hook to access auth context
 * Provides user, session, permissions, and auth methods
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}

/**
 * Hook to check if user has specific permission
 */
export function useHasPermission(
  moduleCode: string,
  permissionCode: string
): boolean {
  const { permissions } = useAuth()

  return permissions.some(
    (p: any) =>
      p.module_code.toLowerCase() === moduleCode.toLowerCase() &&
      p.permission_code.toLowerCase() === permissionCode.toLowerCase()
  )
}

/**
 * Hook to check multiple permissions with ANY logic
 */
export function useHasAnyPermission(
  moduleCode: string,
  permissionCodes: string[]
): boolean {
  const { permissions } = useAuth()

  return permissionCodes.some((pc) =>
    permissions.some(
      (p) =>
        p.module_code.toLowerCase() === moduleCode.toLowerCase() &&
        p.permission_code.toLowerCase() === pc.toLowerCase()
    )
  )
}

/**
 * Hook to check multiple permissions with ALL logic
 */
export function useHasAllPermissions(
  moduleCode: string,
  permissionCodes: string[]
): boolean {
  const { permissions } = useAuth()

  return permissionCodes.every((pc) =>
    permissions.some(
      (p) =>
        p.module_code.toLowerCase() === moduleCode.toLowerCase() &&
        p.permission_code.toLowerCase() === pc.toLowerCase()
    )
  )
}

/**
 * Hook to check if user has role
 */
export function useHasRole(roleCode: string): boolean {
  const { roles } = useAuth()

  return roles.includes(roleCode.toLowerCase())
}

/**
 * Hook to check if user can view module
 */
export function useCanViewModule(moduleCode: string): boolean {
  const { permissions } = useAuth()

  return permissions.some(
    (p) => p.module_code.toLowerCase() === moduleCode.toLowerCase()
  )
}

/**
 * Hook to check if user can create in module
 */
export function useCanCreate(moduleCode: string): boolean {
  return useHasPermission(moduleCode, "create")
}

/**
 * Hook to check if user can edit in module
 */
export function useCanEdit(moduleCode: string): boolean {
  return useHasPermission(moduleCode, "edit")
}

/**
 * Hook to check if user can delete in module
 */
export function useCanDelete(moduleCode: string): boolean {
  return useHasPermission(moduleCode, "delete")
}

/**
 * Hook to check if user can approve in module
 */
export function useCanApprove(moduleCode: string): boolean {
  return useHasPermission(moduleCode, `${moduleCode}_approve`)
}

/**
 * Hook to get user's permission matrix for a module
 */
export function useModulePermissions(
  moduleCode: string
): {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
} {
  return {
    view: useCanViewModule(moduleCode),
    create: useCanCreate(moduleCode),
    edit: useCanEdit(moduleCode),
    delete: useCanDelete(moduleCode),
  }
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}

/**
 * Hook to get current session
 */
export function useSession() {
  const { session, loading } = useAuth()
  return { session, loading }
}

/**
 * Hook to refresh permissions
 */
export function useRefreshPermissions() {
  const { refreshPermissions } = useAuth()
  return refreshPermissions
}

/**
 * Hook to logout user
 */
export function useLogout() {
  const { logout } = useAuth()
  return logout
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}
