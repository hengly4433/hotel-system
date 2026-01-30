-- Add audit logs and timesheet permissions/submenus and grant to ADMIN roles.

-- Permissions
INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('timesheet','CREATE','PROPERTY'),
  ('timesheet','READ','PROPERTY'),
  ('timesheet','UPDATE','PROPERTY'),
  ('timesheet','DELETE','PROPERTY'),
  ('audit','READ','PROPERTY')
ON CONFLICT DO NOTHING;

-- Submenus
INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
  ('rooms','rooms.availability','Availability','/admin/rooms/availability',4),
  ('operations','operations.timesheets','Timesheets','/admin/timesheets',4),
  ('settings','settings.audit','Audit Logs','/admin/settings/audit-logs',9)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

-- Grant to ADMIN roles
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
JOIN rbac_permissions p ON p.deleted_at IS NULL
WHERE r.name = 'ADMIN'
  AND r.deleted_at IS NULL
  AND p.resource IN ('timesheet','audit')
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_submenus (role_id, submenu_id)
SELECT r.id, s.id
FROM rbac_roles r
JOIN rbac_submenus s ON s.deleted_at IS NULL
WHERE r.name = 'ADMIN'
  AND r.deleted_at IS NULL
  AND s.key IN ('rooms.availability','operations.timesheets','settings.audit')
ON CONFLICT DO NOTHING;
