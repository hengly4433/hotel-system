-- Additional menus, submenus, and permissions for guest/property and operations modules.

-- MENUS
INSERT INTO rbac_menus (key, label, sort_order)
VALUES
  ('dashboard','Dashboard',1),
  ('reservations','Reservations',2),
  ('rooms','Rooms',3),
  ('finance','Finance',4),
  ('guests','Guests',5),
  ('operations','Operations',6),
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
  ('finance','finance.folios','Folios & Payments','/admin/finance/folios',1),
  ('guests','guests.list','Guests','/admin/guests',1),
  ('operations','operations.housekeeping','Housekeeping','/admin/housekeeping',1),
  ('operations','operations.maintenance','Maintenance','/admin/maintenance',2),
  ('settings','settings.organizations','Organizations','/admin/settings/organizations',1),
  ('settings','settings.properties','Properties','/admin/settings/properties',2),
  ('settings','settings.rbac','RBAC','/admin/settings/rbac',3),
  ('settings','settings.rbac.users','Users','/admin/settings/rbac/users',4),
  ('settings','settings.rbac.roles','Roles','/admin/settings/rbac/roles',5),
  ('settings','settings.rbac.menus','Menus','/admin/settings/rbac/menus',6),
  ('settings','settings.rbac.submenus','Submenus','/admin/settings/rbac/submenus',7),
  ('settings','settings.rbac.permissions','Permissions','/admin/settings/rbac/permissions',8)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

-- PERMISSIONS
INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('guest','CREATE','PROPERTY'),
  ('guest','READ','PROPERTY'),
  ('guest','UPDATE','PROPERTY'),
  ('guest','DELETE','PROPERTY'),
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
  ('property','DELETE','PROPERTY')
ON CONFLICT DO NOTHING;
