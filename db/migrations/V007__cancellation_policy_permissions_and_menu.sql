-- Cancellation policy permissions and pricing submenu.

INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
  ('pricing','pricing.cancellation_policies','Cancellation Policies','/admin/pricing/cancellation-policies',4)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('cancellation_policy','CREATE','PROPERTY'),
  ('cancellation_policy','READ','PROPERTY'),
  ('cancellation_policy','UPDATE','PROPERTY'),
  ('cancellation_policy','DELETE','PROPERTY')
ON CONFLICT DO NOTHING;
