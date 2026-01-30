-- Employees menu and permissions.

INSERT INTO rbac_menus (key, label, sort_order)
VALUES
  ('operations','Operations',6)
ON CONFLICT DO NOTHING;

INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
  ('operations','operations.employees','Employees','/admin/employees',1)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('employee','CREATE','PROPERTY'),
  ('employee','READ','PROPERTY'),
  ('employee','UPDATE','PROPERTY'),
  ('employee','DELETE','PROPERTY')
ON CONFLICT DO NOTHING;
