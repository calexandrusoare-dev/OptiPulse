/**
 * OptiPulse - Core Constants
 * Module codes, permission codes, and system constants
 */

// ============================================
// MODULE CODES
// ============================================

export const MODULES = {
  HR: "hr",
  FINANCE: "finance",
  ADMIN: "admin",
  DASHBOARD: "dashboard",
} as const

export type ModuleCode = typeof MODULES[keyof typeof MODULES]

// ============================================
// PERMISSION CODES
// ============================================

export const PERMISSIONS = {
  // Generic permissions
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  
  // HR specific
  HR_APPROVE_LEAVE: "approve_leave",
  HR_MANAGE_LEAVE_TYPES: "manage_leave_types",
  HR_VIEW_LEAVE_BALANCE: "view_leave_balance",
  HR_MANAGE_TIME_ENTRIES: "manage_time_entries",
  HR_APPROVE_OVERTIME: "approve_overtime",
  
  // Finance specific
  FINANCE_APPROVE_EXPENSE: "approve_expense",
  FINANCE_MANAGE_CATEGORIES: "manage_categories",
  FINANCE_MANAGE_BUDGET: "manage_budget",
  FINANCE_VIEW_REPORTS: "view_reports",
  
  // Admin specific
  ADMIN_MANAGE_USERS: "manage_users",
  ADMIN_MANAGE_ROLES: "manage_roles",
  ADMIN_MANAGE_PERMISSIONS: "manage_permissions",
  ADMIN_VIEW_AUDIT_LOG: "view_audit_log",
  ADMIN_SYSTEM_SETTINGS: "system_settings",
} as const

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// ============================================
// ROLE CODES
// ============================================

export const ROLE_CODES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  HR_MANAGER: "hr_manager",
  HR_STAFF: "hr_staff",
  FINANCE_MANAGER: "finance_manager",
  FINANCE_STAFF: "finance_staff",
  EMPLOYEE: "employee",
  GUEST: "guest",
} as const

export type RoleCode = typeof ROLE_CODES[keyof typeof ROLE_CODES]

// ============================================
// ROLE DEFINITIONS
// ============================================

export const ROLE_DEFINITIONS = {
  [ROLE_CODES.SUPER_ADMIN]: {
    name: "Super Administrator",
    description: "Full system access",
    permissions: Object.values(PERMISSIONS),
  },
  [ROLE_CODES.ADMIN]: {
    name: "Administrator",
    description: "System administration",
    permissions: [
      PERMISSIONS.ADMIN_MANAGE_USERS,
      PERMISSIONS.ADMIN_MANAGE_ROLES,
      PERMISSIONS.ADMIN_VIEW_AUDIT_LOG,
    ],
  },
  [ROLE_CODES.HR_MANAGER]: {
    name: "HR Manager",
    description: "HR module management",
    permissions: [
      PERMISSIONS.HR_APPROVE_LEAVE,
      PERMISSIONS.HR_MANAGE_LEAVE_TYPES,
      PERMISSIONS.HR_VIEW_LEAVE_BALANCE,
      PERMISSIONS.HR_MANAGE_TIME_ENTRIES,
      PERMISSIONS.HR_APPROVE_OVERTIME,
      PERMISSIONS.VIEW,
    ],
  },
  [ROLE_CODES.HR_STAFF]: {
    name: "HR Staff",
    description: "HR operations",
    permissions: [
      PERMISSIONS.HR_MANAGE_TIME_ENTRIES,
      PERMISSIONS.VIEW,
    ],
  },
  [ROLE_CODES.FINANCE_MANAGER]: {
    name: "Finance Manager",
    description: "Finance module management",
    permissions: [
      PERMISSIONS.FINANCE_APPROVE_EXPENSE,
      PERMISSIONS.FINANCE_MANAGE_CATEGORIES,
      PERMISSIONS.FINANCE_MANAGE_BUDGET,
      PERMISSIONS.FINANCE_VIEW_REPORTS,
      PERMISSIONS.VIEW,
    ],
  },
  [ROLE_CODES.FINANCE_STAFF]: {
    name: "Finance Staff",
    description: "Finance operations",
    permissions: [
      PERMISSIONS.FINANCE_VIEW_REPORTS,
      PERMISSIONS.VIEW,
    ],
  },
  [ROLE_CODES.EMPLOYEE]: {
    name: "Employee",
    description: "Basic employee access",
    permissions: [
      PERMISSIONS.VIEW,
      PERMISSIONS.CREATE,
    ],
  },
  [ROLE_CODES.GUEST]: {
    name: "Guest",
    description: "Guest access",
    permissions: [
      PERMISSIONS.VIEW,
    ],
  },
} as const

// ============================================
// ACTION TYPES FOR AUDIT LOG
// ============================================

export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  VIEW: "VIEW",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  FAILED_LOGIN: "FAILED_LOGIN",
} as const

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_VERIFY_EMAIL: "/auth/verify-email",
  AUTH_RESET_PASSWORD: "/auth/reset-password",
  
  // Users
  USERS: "/users",
  USER_BY_ID: "/users/{id}",
  USER_ROLES: "/users/{id}/roles",
  USER_PERMISSIONS: "/users/{id}/permissions",
  
  // Roles
  ROLES: "/roles",
  ROLE_BY_ID: "/roles/{id}",
  ROLE_PERMISSIONS: "/roles/{id}/permissions",
  
  // Audit
  AUDIT_LOGS: "/audit-logs",
} as const

// ============================================
// HTTP STATUS CODES
// ============================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRES_UPPERCASE: true,
  PASSWORD_REQUIRES_NUMBER: true,
  PASSWORD_REQUIRES_SPECIAL: false,
} as const

// ============================================
// SESSION & SECURITY
// ============================================

export const SESSION_CONFIG = {
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  REFRESH_TOKEN_BEFORE_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
} as const

// ============================================
// LOCALIZATION
// ============================================

export const SUPPORTED_LANGUAGES = {
  EN: "en",
  RO: "ro",
} as const

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.EN
