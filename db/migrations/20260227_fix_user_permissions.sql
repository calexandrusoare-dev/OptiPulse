-- Migration: Fix incorrect foreign key constraints on core.user_permissions
-- Date: 2026-02-27
-- WARNING: Test this on a staging DB before running in production.

BEGIN;

-- Drop possible existing constraints (safe with IF EXISTS)
ALTER TABLE IF EXISTS core.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_pkey;
ALTER TABLE IF EXISTS core.user_permissions DROP CONSTRAINT IF EXISTS fk_valid_module_permission;
ALTER TABLE IF EXISTS core.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_user_id_fkey;
ALTER TABLE IF EXISTS core.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_module_id_fkey;
ALTER TABLE IF EXISTS core.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_permission_id_fkey;

-- Recreate primary key
ALTER TABLE IF EXISTS core.user_permissions
  ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, module_id, permission_id);

-- Recreate correct foreign keys
ALTER TABLE IF EXISTS core.user_permissions
  ADD CONSTRAINT user_permissions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS core.user_permissions
  ADD CONSTRAINT user_permissions_module_id_fkey
    FOREIGN KEY (module_id) REFERENCES core.modules(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS core.user_permissions
  ADD CONSTRAINT user_permissions_permission_id_fkey
    FOREIGN KEY (permission_id) REFERENCES core.permissions(id) ON DELETE CASCADE;

-- Ensure the pair (module_id, permission_id) exists in module_permission_definitions
ALTER TABLE IF EXISTS core.user_permissions
  ADD CONSTRAINT user_permissions_module_permission_definitions_fkey
    FOREIGN KEY (module_id, permission_id)
    REFERENCES core.module_permission_definitions(module_id, permission_id) ON DELETE CASCADE;

COMMIT;
