-- Migration: Add RBAC tables (roles, role_permissions, user_roles), audit_logs, and RLS policies
-- Date: 2026-03-03
-- This script also includes row level security policies for business tables.

BEGIN;

-- ================================
-- RBAC core tables
-- ================================

CREATE TABLE IF NOT EXISTS core.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
    assigned_at timestamp with time zone DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS core.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    assigned_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role_id)

-- Drop legacy tables that should no longer exist
DROP TABLE IF EXISTS core.user_permissions CASCADE;
DROP TABLE IF EXISTS core.module_permissions CASCADE;
DROP TABLE IF EXISTS core.module_permission_definitions CASCADE;

-- Clean up legacy column if present
ALTER TABLE core.users DROP COLUMN IF EXISTS role_id;
);

-- ================================
-- Audit log table
-- ================================

CREATE TABLE IF NOT EXISTS core.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES core.users(id),
    action text NOT NULL,
    table_name text NOT NULL,
    record_id text NOT NULL,
    old_value jsonb,
    new_value jsonb,
    details text,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- ================================
-- View that consolidates permissions and roles
-- ================================
-- existing v_user_permissions can remain; role-based expansion will be handled by a
-- materialized view later if desired. For now we keep the view as is.

-- ================================
-- Row-Level Security
-- ================================
-- Enable RLS for tables and add example policies.

-- generic helper function to drop policy if exists
DO $$
BEGIN
  EXECUTE 'CREATE OR REPLACE FUNCTION core.safe_drop_policy(text, text) RETURNS void AS $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = $1 AND policyname = $2
      ) THEN
        EXECUTE format(''ALTER TABLE %I DROP POLICY %I;'', $1, $2);
      END IF;
    END;
  $$ LANGUAGE plpgsql;';
END$$;
+-- Indexes for performance
+CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON core.user_roles(user_id);
+CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON core.user_roles(role_id);
+CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON core.role_permissions(role_id);
+CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON core.role_permissions(permission_id);
+CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON core.audit_logs(user_id);
+CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON core.audit_logs(created_at DESC);
+

-- hr.leave_requests
ALTER TABLE hr.leave_requests ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('leave_requests','hr_read_own');
CREATE POLICY hr_read_own
  ON hr.leave_requests
  FOR SELECT
  USING ( auth.uid() = employee_id );

PERFORM core.safe_drop_policy('leave_requests','hr_write_own');
CREATE POLICY hr_write_own
  ON hr.leave_requests
  FOR ALL
  USING ( auth.uid() = employee_id )
  WITH CHECK ( auth.uid() = employee_id );

+-- Admin bypass policy for hr.leave_requests
+PERFORM core.safe_drop_policy('leave_requests', 'hr_admin_full_access');
+CREATE POLICY hr_admin_full_access
+  ON hr.leave_requests
+  FOR ALL
+  USING ( auth.role() IN ('admin', 'super_admin') )
+  WITH CHECK ( auth.role() IN ('admin', 'super_admin') );

-- hr.leave_balances (employees should only see their own balance)
ALTER TABLE hr.leave_balances ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('leave_balances','hr_balance_read');
CREATE POLICY hr_balance_read
  ON hr.leave_balances
  FOR SELECT
  USING ( auth.uid() = employee_id );

-- hr.overtime_requests
ALTER TABLE hr.overtime_requests ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('overtime_requests','hr_overtime_read_own');
CREATE POLICY hr_overtime_read_own
  ON hr.overtime_requests
  FOR SELECT
  USING ( auth.uid() = employee_id );

PERFORM core.safe_drop_policy('overtime_requests','hr_overtime_write_own');
CREATE POLICY hr_overtime_write_own

  +-- Admin bypass policy for hr.overtime_requests
  +PERFORM core.safe_drop_policy('overtime_requests', 'hr_admin_overtime_full_access');
  +CREATE POLICY hr_admin_overtime_full_access
  +  ON hr.overtime_requests
  +  FOR ALL
  +  USING ( auth.role() IN ('admin', 'super_admin') )
  +  WITH CHECK ( auth.role() IN ('admin', 'super_admin') );
  ON hr.overtime_requests
  FOR ALL
  USING ( auth.uid() = employee_id )
  WITH CHECK ( auth.uid() = employee_id );

-- finance.expense_requests
ALTER TABLE finance.expense_requests ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('expense_requests','finance_expense_read_own');
CREATE POLICY finance_expense_read_own
  ON finance.expense_requests
  FOR SELECT
  USING ( auth.uid() = employee_id );

PERFORM core.safe_drop_policy('expense_requests','finance_expense_write_own');
CREATE POLICY finance_expense_write_own

  +-- Admin bypass policy for finance.expense_requests
  +PERFORM core.safe_drop_policy('expense_requests', 'finance_admin_full_access');
  +CREATE POLICY finance_admin_full_access
  +  ON finance.expense_requests
  +  FOR ALL
  +  USING ( auth.role() IN ('admin', 'super_admin') )
  +  WITH CHECK ( auth.role() IN ('admin', 'super_admin') );
  ON finance.expense_requests
  FOR ALL
  USING ( auth.uid() = employee_id )
  WITH CHECK ( auth.uid() = employee_id );

-- finance.budgets: only finance staff or manager can read/write (example)
ALTER TABLE finance.budgets ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('budgets','finance_budgets_read');
CREATE POLICY finance_budgets_read
  ON finance.budgets
  FOR SELECT
  USING ( auth.role() IN ('finance_manager','finance_staff','admin','super_admin') );

PERFORM core.safe_drop_policy('budgets','finance_budgets_write');
CREATE POLICY finance_budgets_write
  ON finance.budgets
  FOR ALL
  USING ( auth.role() IN ('finance_manager','admin','super_admin') )
  WITH CHECK ( auth.role() IN ('finance_manager','admin','super_admin') );

-- core.users: users may update own profile, admins may view all
ALTER TABLE core.users ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('users','user_self');
CREATE POLICY user_self
  ON core.users
  FOR ALL
  USING ( auth.uid() = id OR auth.role() IN ('admin','super_admin') )
  WITH CHECK ( auth.uid() = id OR auth.role() IN ('admin','super_admin') );

-- role management tables: only admins / super_admins may modify
ALTER TABLE core.roles ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('roles','roles_admin');
CREATE POLICY roles_admin
  ON core.roles
  FOR ALL
  USING ( auth.role() IN ('admin','super_admin') )
  WITH CHECK ( auth.role() IN ('admin','super_admin') );

ALTER TABLE core.role_permissions ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('role_permissions','role_permissions_admin');
CREATE POLICY role_permissions_admin
  ON core.role_permissions
  FOR ALL
  USING ( auth.role() IN ('admin','super_admin') )
  WITH CHECK ( auth.role() IN ('admin','super_admin') );

ALTER TABLE core.user_roles ENABLE ROW LEVEL SECURITY;
PERFORM core.safe_drop_policy('user_roles','user_roles_admin');
CREATE POLICY user_roles_admin
  ON core.user_roles
  FOR ALL
  USING ( auth.role() IN ('admin','super_admin') )
  WITH CHECK ( auth.role() IN ('admin','super_admin') );

-- Apply similar policies for other tables as needed.

-- ================================
-- Seed initial modules, permissions, roles
-- ================================

-- modules
INSERT INTO core.modules (code, name, description, is_active)
VALUES
  ('hr', 'Human Resources', 'HR module', true),
  ('finance', 'Finance', 'Finance module', true),
  ('admin', 'Administration', 'Admin module', true),
  ('dashboard', 'Dashboard', 'Main dashboard', true)
ON CONFLICT (code) DO NOTHING;

-- permissions (basic set)
INSERT INTO core.permissions (code, name, module_code, description, is_active)
VALUES
  ('view', 'View', 'global', 'View permission', true),
  ('create', 'Create', 'global', 'Create permission', true),
  ('edit', 'Edit', 'global', 'Edit permission', true),
  ('delete', 'Delete', 'global', 'Delete permission', true),
  ('approve_leave', 'Approve Leave', 'hr', 'Approve leave requests', true),
  ('manage_leave_types', 'Manage Leave Types', 'hr', 'HR manage leave types', true),
  ('view_leave_balance', 'View Leave Balance', 'hr', 'HR view balances', true),
  ('manage_time_entries', 'Manage Time Entries', 'hr', 'HR time entries', true),
  ('approve_overtime', 'Approve Overtime', 'hr', 'Approve overtime', true),
  ('approve_expense', 'Approve Expense', 'finance', 'Approve expense requests', true),
  ('manage_categories', 'Manage Expense Categories', 'finance', 'Finance categories', true),
  ('manage_budget', 'Manage Budget', 'finance', 'Finance budgets', true),
  ('view_reports', 'View Reports', 'finance', 'Finance reports', true),
  ('manage_users', 'Manage Users', 'admin', 'Admin manage users', true),
  ('manage_roles', 'Manage Roles', 'admin', 'Admin manage roles', true),
  ('manage_permissions', 'Manage Permissions', 'admin', 'Admin manage permissions', true),
  ('view_audit_log', 'View Audit Log', 'admin', 'View audit logs', true),
  ('system_settings', 'System Settings', 'admin', 'Access system settings', true)
ON CONFLICT (code) DO NOTHING;

-- create default roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM core.roles WHERE code = 'super_admin') THEN
    INSERT INTO core.roles (code, name, description) VALUES
      ('super_admin', 'Super Administrator', 'Full system access');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM core.roles WHERE code = 'admin') THEN
    INSERT INTO core.roles (code, name, description) VALUES
      ('admin', 'Administrator', 'System administration');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM core.roles WHERE code = 'hr_manager') THEN
    INSERT INTO core.roles (code, name, description) VALUES
      ('hr_manager', 'HR Manager', 'HR module manager');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM core.roles WHERE code = 'finance_manager') THEN
    INSERT INTO core.roles (code, name, description) VALUES
      ('finance_manager', 'Finance Manager', 'Finance module manager');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM core.roles WHERE code = 'employee') THEN
    INSERT INTO core.roles (code, name, description) VALUES
      ('employee', 'Employee', 'Regular employee');
  END IF;
END$$;

COMMIT;

-- ================================
-- Sanity checks (run manually after migration)
-- ================================
-- SELECT * FROM core.roles LIMIT 5;
-- SELECT count(*) FROM core.permissions;
-- SELECT count(*) FROM core.modules;
-- SELECT * FROM pg_policies WHERE tablename IN ('leave_requests', 'expense_requests', 'budgets', 'users') LIMIT 10;
