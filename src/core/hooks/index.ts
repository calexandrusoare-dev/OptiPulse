/**
 * Core Hooks
 * Central export point for all custom hooks
 */

export {
  useAuth,
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useHasRole,
  useCanViewModule,
  useCanCreate,
  useCanEdit,
  useCanDelete,
  useCanApprove,
  useModulePermissions,
  useCurrentUser,
  useSession,
  useRefreshPermissions,
  useLogout,
  useIsAuthenticated,
} from "./useAuth"

export {
  useRoles,
  useRole,
  useRoleByCode,
  useAssignRole,
  useRemoveRole,
} from "./useRoles"

export {
  useAuditLogs,
  useRecentActivity,
  useUserActivity,
  useLogAuditAction,
  useActivityReport,
} from "./useAudit"
