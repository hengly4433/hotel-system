-- Reports Permissions
INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('report', 'READ', 'PROPERTY')
ON CONFLICT DO NOTHING;

-- Reports Menu
INSERT INTO rbac_menus (key, label, sort_order)
VALUES
  ('reports', 'Reports', 5)
ON CONFLICT DO NOTHING;

-- Reports Submenus
INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
  ('reports', 'reports.revenue', 'Revenue', '/admin/reports?tab=revenue', 1),
  ('reports', 'reports.occupancy', 'Occupancy', '/admin/reports?tab=occupancy', 2),
  ('reports', 'reports.guests', 'Guests In-House', '/admin/reports?tab=guests', 3),
  ('reports', 'reports.arrivals', 'Arrivals', '/admin/reports?tab=arrivals', 4),
  ('reports', 'reports.departures', 'Departures', '/admin/reports?tab=departures', 5),
  ('reports', 'reports.housekeeping', 'Housekeeping', '/admin/reports?tab=housekeeping', 6)
) AS s(menu_key, key, label, route, sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

-- Grant to ADMIN Role
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
JOIN rbac_permissions p ON p.resource = 'report' AND p.action = 'READ' AND p.scope = 'PROPERTY'
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_submenus (role_id, submenu_id)
SELECT r.id, s.id
FROM rbac_roles r
JOIN rbac_submenus s ON s.key LIKE 'reports.%'
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;
