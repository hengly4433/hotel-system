-- Ensure ADMIN roles have all permissions and submenus.

INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
JOIN rbac_permissions p ON p.deleted_at IS NULL
WHERE r.name = 'ADMIN'
  AND r.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_submenus (role_id, submenu_id)
SELECT r.id, s.id
FROM rbac_roles r
JOIN rbac_submenus s ON s.deleted_at IS NULL
WHERE r.name = 'ADMIN'
  AND r.deleted_at IS NULL
ON CONFLICT DO NOTHING;
