-- Optional RBAC seed data for local/dev environments.

-- MENUS
INSERT INTO rbac_menus (key, label, sort_order)
VALUES
  ('dashboard','Dashboard',1),
  ('reservations','Reservations',2),
  ('rooms','Rooms',3),
  ('finance','Finance',4),
  ('pricing','Pricing',5),
  ('guests','Guests',6),
  ('operations','Operations',7),
  ('settings','Settings',99)
ON CONFLICT DO NOTHING;

-- SUBMENUS
INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
  ('dashboard','dashboard.home','Dashboard','/admin',1),
  ('reservations','reservations.list','Reservation List','/admin/reservations',1),
  ('reservations','reservations.create','Create Reservation','/admin/reservations/new',2),
  ('reservations','reservations.checkin','Check-in','/admin/checkin',3),
  ('rooms','rooms.list','Rooms','/admin/rooms',1),
  ('rooms','rooms.types','Room Types','/admin/rooms/types',2),
  ('rooms','rooms.board','Room Board','/admin/rooms/board',3),
  ('rooms','rooms.availability','Availability','/admin/rooms/availability',4),
  ('finance','finance.folios','Folios & Payments','/admin/finance/folios',1),
  ('pricing','pricing.home','Pricing','/admin/pricing',1),
  ('pricing','pricing.rate_plans','Rate Plans','/admin/pricing/rate-plans',2),
  ('pricing','pricing.nightly_prices','Nightly Prices','/admin/pricing/nightly-prices',3),
  ('pricing','pricing.taxes_fees','Taxes & Fees','/admin/pricing/taxes-fees',4),
  ('pricing','pricing.cancellation_policies','Cancellation Policies','/admin/pricing/cancellation-policies',5),
  ('guests','guests.list','Guests','/admin/guests',1),
  ('operations','operations.employees','Employees','/admin/employees',1),
  ('operations','operations.housekeeping','Housekeeping','/admin/housekeeping',2),
  ('operations','operations.maintenance','Maintenance','/admin/maintenance',3),
  ('operations','operations.timesheets','Timesheets','/admin/timesheets',4),
  ('settings','settings.organizations','Organizations','/admin/settings/organizations',1),
  ('settings','settings.properties','Properties','/admin/settings/properties',2),
  ('settings','settings.rbac','RBAC','/admin/settings/rbac',3),
  ('settings','settings.rbac.users','Users','/admin/settings/rbac/users',4),
  ('settings','settings.rbac.roles','Roles','/admin/settings/rbac/roles',5),
  ('settings','settings.rbac.menus','Menus','/admin/settings/rbac/menus',6),
  ('settings','settings.rbac.submenus','Submenus','/admin/settings/rbac/submenus',7),
  ('settings','settings.rbac.permissions','Permissions','/admin/settings/rbac/permissions',8),
  ('settings','settings.audit','Audit Logs','/admin/settings/audit-logs',9)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

-- PERMISSIONS
INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('reservation','CREATE','PROPERTY'),
  ('reservation','READ','PROPERTY'),
  ('reservation','UPDATE','PROPERTY'),
  ('reservation','CANCEL','PROPERTY'),
  ('reservation','CHECKIN','PROPERTY'),
  ('reservation','CHECKOUT','PROPERTY'),
  ('room','CREATE','PROPERTY'),
  ('room','READ','PROPERTY'),
  ('room','UPDATE','PROPERTY'),
  ('room','DELETE','PROPERTY'),
  ('room','UPDATE_STATUS','PROPERTY'),
  ('room_type','CREATE','PROPERTY'),
  ('room_type','UPDATE','PROPERTY'),
  ('room_type','DELETE','PROPERTY'),
  ('folio','READ','PROPERTY'),
  ('folio','UPDATE','PROPERTY'),
  ('folio','CLOSE','PROPERTY'),
  ('guest','CREATE','PROPERTY'),
  ('guest','READ','PROPERTY'),
  ('guest','UPDATE','PROPERTY'),
  ('guest','DELETE','PROPERTY'),
  ('employee','CREATE','PROPERTY'),
  ('employee','READ','PROPERTY'),
  ('employee','UPDATE','PROPERTY'),
  ('employee','DELETE','PROPERTY'),
  ('timesheet','CREATE','PROPERTY'),
  ('timesheet','READ','PROPERTY'),
  ('timesheet','UPDATE','PROPERTY'),
  ('timesheet','DELETE','PROPERTY'),
  ('housekeeping','CREATE','PROPERTY'),
  ('housekeeping','READ','PROPERTY'),
  ('housekeeping','UPDATE','PROPERTY'),
  ('housekeeping','DELETE','PROPERTY'),
  ('maintenance','CREATE','PROPERTY'),
  ('maintenance','READ','PROPERTY'),
  ('maintenance','UPDATE','PROPERTY'),
  ('maintenance','DELETE','PROPERTY'),
  ('organization','CREATE','PROPERTY'),
  ('organization','READ','PROPERTY'),
  ('organization','UPDATE','PROPERTY'),
  ('organization','DELETE','PROPERTY'),
  ('property','CREATE','PROPERTY'),
  ('property','READ','PROPERTY'),
  ('property','UPDATE','PROPERTY'),
  ('property','DELETE','PROPERTY'),
  ('payment','CAPTURE','PROPERTY'),
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
  ('tax_fee','DELETE','PROPERTY'),
  ('cancellation_policy','CREATE','PROPERTY'),
  ('cancellation_policy','READ','PROPERTY'),
  ('cancellation_policy','UPDATE','PROPERTY'),
  ('cancellation_policy','DELETE','PROPERTY'),
  ('audit','READ','PROPERTY'),
  ('rbac','ADMIN','PROPERTY')
ON CONFLICT DO NOTHING;

-- ADMIN role (global) + grants
INSERT INTO rbac_roles (name)
SELECT 'ADMIN'
WHERE NOT EXISTS (
  SELECT 1 FROM rbac_roles
  WHERE name = 'ADMIN' AND property_id IS NULL AND deleted_at IS NULL
);

INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r
CROSS JOIN rbac_permissions p
WHERE r.name = 'ADMIN'
  AND r.property_id IS NULL
  AND r.deleted_at IS NULL
  AND p.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_submenus (role_id, submenu_id)
SELECT r.id, s.id
FROM rbac_roles r
CROSS JOIN rbac_submenus s
WHERE r.name = 'ADMIN'
  AND r.property_id IS NULL
  AND r.deleted_at IS NULL
  AND s.deleted_at IS NULL
ON CONFLICT DO NOTHING;
