/**
 * OptiPulse - Consolidated Type Definitions
 * Enterprise RBAC System - Core Types
 */

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
  is_active: boolean
}

export interface BusinessUser extends User {
  department?: string
  location_id?: string
  metadata?: Record<string, any>
}

export interface AuthSession {
  user: User | null
  session: any
}

// ============================================
// RBAC - ROLES & PERMISSIONS
// ============================================

export interface Role {
  id: string
  code: string
  name: string
  description?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at?: string
}

export interface Permission {
  id: string
  code: string
  name: string
  description?: string
  module_code: string
  created_at?: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  assigned_at?: string
}

export interface UserPermission {
  user_id: string
  module_code: string
  permission_code: string
}

// ============================================
// MODULE DEFINITIONS
// ============================================

export interface Module {
  id: string
  code: string
  name: string
  description?: string
  icon?: string
  order?: number
  is_active: boolean
  created_at?: string
}

export interface ModuleWithPermissions {
  code: string
  name: string
  permissions: string[]
  hasAccess: boolean
}

// ============================================
// CONTEXT & PROVIDER TYPES
// ============================================

export interface AuthContextType {
  session: any
  user: User | null
  roles: string[] // role codes
  permissions: UserPermission[]
  loading: boolean
  isAuthenticated: boolean
  refreshPermissions: () => Promise<void>
  hasRole: (roleCode: string) => boolean
  hasPermission: (moduleCode: string, permissionCode: string) => boolean
  logout: () => Promise<void>
}

export interface RoleContextType {
  roles: Role[]
  permissions: Permission[]
  loading: boolean
  hasPermission: (moduleCode: string, permissionCode: string) => boolean
}

// ============================================
// AUDIT & LOGGING
// ============================================

export interface AuditLog {
  id: string
  user_id: string
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "APPROVE" | "REJECT"
  table_name: string
  record_id: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  details?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// ============================================
// HR MODULE TYPES
// ============================================

export interface LeaveType {
  id: string
  code: string
  name: string
  days_per_year: number
  is_active: boolean
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  reason?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  year: number
  total_days: number
  used_days: number
  remaining_days: number
}

export interface TimeEntry {
  id: string
  employee_id: string
  date: string
  hours_worked: number
  task_description?: string
  created_at: string
  updated_at: string
}

export interface OvertimeRequest {
  id: string
  employee_id: string
  date: string
  hours: number
  reason?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

// ============================================
// FINANCE MODULE TYPES
// ============================================

export interface ExpenseCategory {
  id: string
  code: string
  name: string
  monthly_limit?: number
  is_active: boolean
}

export interface ExpenseRequest {
  id: string
  employee_id: string
  category_id: string
  amount: number
  currency: string
  description: string
  receipt_url?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  approved_by?: string
  approved_at?: string
  date_submitted: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  department_id: string
  name: string
  amount: number
  spent: number
  currency: string
  fiscal_year: number
  created_at: string
  updated_at: string
}

// ============================================
// ADMIN MODULE TYPES
// ============================================

export interface UserManagementData {
  id: string
  email: string
  full_name?: string
  roles: string[]
  is_active: boolean
  created_at: string
  permissions_override?: UserPermission[]
}

export interface RoleAssignment {
  user_id: string
  role_id: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// ERROR TYPES
// ============================================

export interface AuthError {
  code: string
  message: string
  details?: string
}

export class PermissionDeniedError extends Error {
  constructor(message: string = "Permission denied") {
    super(message)
    this.name = "PermissionDeniedError"
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

// ============================================
// PERMISSION CHECK PARAMS
// ============================================

export interface PermissionCheckParams {
  moduleCode: string
  permissionCode: string
}

export interface PermissionCheckResult {
  hasAccess: boolean
  reason?: string
}
