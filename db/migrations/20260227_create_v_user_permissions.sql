-- Migration: Create view core.v_user_permissions
-- Date: 2026-02-27
-- WARNING: Test on staging before running in production.

BEGIN;

-- Create or replace view that normalizes permissions for frontend
CREATE OR REPLACE VIEW core.v_user_permissions AS
SELECT
  up.user_id,
  m.code AS module_code,
  p.code AS permission_code
FROM core.user_permissions up
JOIN core.modules m ON up.module_id = m.id
JOIN core.permissions p ON up.permission_id = p.id;

COMMIT;
