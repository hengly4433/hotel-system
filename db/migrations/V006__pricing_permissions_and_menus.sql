-- Pricing menus, submenus, and permissions.

INSERT INTO rbac_menus (key, label, sort_order)
VALUES ('pricing', 'Pricing', 5)
ON CONFLICT DO NOTHING;

INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
  ('pricing','pricing.rate_plans','Rate Plans','/admin/pricing/rate-plans',1),
  ('pricing','pricing.nightly_prices','Nightly Prices','/admin/pricing/nightly-prices',2),
  ('pricing','pricing.taxes_fees','Taxes & Fees','/admin/pricing/taxes-fees',3)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('rate_plan','CREATE','PROPERTY'),
  ('rate_plan','READ','PROPERTY'),
  ('rate_plan','UPDATE','PROPERTY'),
  ('rate_plan','DELETE','PROPERTY'),
  ('rate_plan_price','CREATE','PROPERTY'),
  ('rate_plan_price','READ','PROPERTY'),
  ('rate_plan_price','UPDATE','PROPERTY'),
  ('rate_plan_price','DELETE','PROPERTY'),
  ('tax_fee','CREATE','PROPERTY'),
  ('tax_fee','READ','PROPERTY'),
  ('tax_fee','UPDATE','PROPERTY'),
  ('tax_fee','DELETE','PROPERTY')
ON CONFLICT DO NOTHING;
