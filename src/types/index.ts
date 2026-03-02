/**
 * OptiPulse - TypeScript Type Definitions
 * Enterprise RBAC System
 */

/**
 * User Permission from v_user_permissions view
 * Normalized enterprise permission model
 */
export interface UserPermission {
  user_id: string
  module_code: string
  permission_code: string
}

/**
 * Module definition (from core.modules)
 */
export interface Module {
  id: string
  code: string
  name: string
  created_at?: string
}

/**
 * Permission definition (from core.permissions)
 */
export interface Permission {
  id: string
  code: string
  name: string
  created_at?: string
}

/**
 * Module-Permission definition link
 */
export interface ModulePermissionDefinition {
  module_id: string
  permission_id: string
  created_at?: string
}

/**
 * User model (from auth.users + core.users)
 */
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

/**
 * Extended User with Business Data
 */
export interface BusinessUser extends User {
  department?: string
  location_id?: string
  is_active: boolean
  metadata?: Record<string, any>
}

/**
 * Auth Context Type
 */
export interface AuthContextType {
  session: any
  user: User | null
  permissions: UserPermission[]
  loading: boolean
  refreshPermissions: () => Promise<void>
}

/**
 * Permission Check Parameters
 */
export interface PermissionCheckParams {
  moduleCode: string
  permissionCode: string
}

/**
 * Module with Permissions
 */
export interface ModuleWithPermissions {
  code: string
  name: string
  permissions: string[]
  hasAccess: boolean
}

/**
 * HR Module Types
 */
export interface LeaveType {
  id: string
  code: string
  name: string
  days_per_year: number
  created_at?: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days: number
  status: "pending" | "approved" | "rejected" | "cancelled"
  reason?: string
  created_at?: string
  updated_at?: string
  reviewer_id?: string
  reviewed_at?: string
}

export interface TimeEntry {
  id: string
  employee_id: string
  date: string
  hours: number
  project_id?: string
  description?: string
  created_at?: string
  updated_at?: string
}

/**
 * Finance Module Types
 */
export interface ExpenseRequest {
  id: string
  employee_id: string
  category: string
  amount: number
  currency: string
  description: string
  receipt_url?: string
  status: "pending" | "approved" | "rejected" | "reimbursed"
  created_at?: string
  updated_at?: string
  reviewer_id?: string
  reviewed_at?: string
}

export interface Budget {
  id: string
  department: string
  fiscal_year: number
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  created_at?: string
  updated_at?: string
}

export interface KPI {
  id: string
  name: string
  target: number
  actual: number
  unit: string
  period: string
  responsible_person?: string
  created_at?: string
  updated_at?: string
}

/**
 * Admin Module Types
 */
export interface UserWithPermissions extends User {
  permissions: UserPermission[]
  is_active: boolean
  created_at?: string
}

/**
 * API Response Type
 */
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

/**
 * Pagination Type
 */
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
