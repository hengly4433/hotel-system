-- =============================================
-- SEED DATA: System Admin (User, Role, Permissions, Menus)
-- =============================================

-- 1. Create permissions for System management
INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('system_logs', 'READ', 'GLOBAL'),
  ('audit_logs', 'READ', 'GLOBAL')
ON CONFLICT DO NOTHING;

-- 2. Create "System" Menu
INSERT INTO rbac_menus (key, label, sort_order)
VALUES
  ('system', 'System', 100)
ON CONFLICT DO NOTHING;

-- 3. Create Submenus for System
-- Need to fetch menu_id dynamically
WITH system_menu AS (
    SELECT id FROM rbac_menus WHERE key = 'system'
)
INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT id, 'system.logs', 'System Logs', '/admin/system/logs', 1 FROM system_menu
UNION ALL
SELECT id, 'system.audit', 'Audit Logs', '/admin/system/audit', 2 FROM system_menu
ON CONFLICT DO NOTHING;

-- 4. Create SYSTEM_ADMIN Role (Global)
INSERT INTO rbac_roles (name, property_id)
SELECT 'SYSTEM_ADMIN', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM rbac_roles WHERE name = 'SYSTEM_ADMIN' AND property_id IS NULL AND deleted_at IS NULL
);

-- 5. Grant Permissions to SYSTEM_ADMIN
-- Grant newly created system permissions + all existing permissions to SYSTEM_ADMIN
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
CROSS JOIN rbac_permissions p
WHERE r.name = 'SYSTEM_ADMIN'
  AND r.property_id IS NULL
  AND r.deleted_at IS NULL
  AND p.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- 6. Grant Menus/Submenus to SYSTEM_ADMIN
INSERT INTO rbac_role_submenus (role_id, submenu_id)
SELECT r.id, s.id
FROM rbac_roles r
CROSS JOIN rbac_submenus s
WHERE r.name = 'SYSTEM_ADMIN'
  AND r.property_id IS NULL
  AND r.deleted_at IS NULL
  AND s.deleted_at IS NULL
ON CONFLICT (role_id, submenu_id) DO NOTHING;

-- 7. Create System Admin User
-- Password: Password@123
INSERT INTO rbac_users (email, password_hash, status)
VALUES (
    'systemadmin@hotel.com',
    crypt('Password@123', gen_salt('bf')),
    'ACTIVE'
)
ON CONFLICT (email) WHERE deleted_at IS NULL DO NOTHING;

-- 8. Assign SYSTEM_ADMIN Role to the User
INSERT INTO rbac_user_roles (user_id, role_id)
SELECT u.id, r.id
FROM rbac_users u
JOIN rbac_roles r ON r.name = 'SYSTEM_ADMIN' AND r.property_id IS NULL
WHERE u.email = 'systemadmin@hotel.com'
ON CONFLICT (user_id, role_id) DO NOTHING;
