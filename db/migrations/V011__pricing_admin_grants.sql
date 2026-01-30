-- Ensure pricing home submenu exists and grant pricing permissions/submenus to ADMIN roles.

INSERT INTO rbac_menus (key, label, sort_order)
VALUES ('pricing', 'Pricing', 5)
ON CONFLICT DO NOTHING;

INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
  ('pricing','pricing.home','Pricing','/admin/pricing',0)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
JOIN rbac_permissions p ON p.deleted_at IS NULL
WHERE r.name = 'ADMIN'
  AND r.deleted_at IS NULL
  AND p.resource IN ('rate_plan','rate_plan_price','tax_fee','cancellation_policy')
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_submenus (role_id, submenu_id)
SELECT r.id, s.id
FROM rbac_roles r
JOIN rbac_submenus s ON s.deleted_at IS NULL
WHERE r.name = 'ADMIN'
  AND r.deleted_at IS NULL
  AND s.key IN (
    'pricing.home',
    'pricing.rate_plans',
    'pricing.nightly_prices',
    'pricing.taxes_fees',
    'pricing.cancellation_policies'
  )
ON CONFLICT DO NOTHING;
