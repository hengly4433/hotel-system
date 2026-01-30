-- Baseline menus, submenus, and permissions for admin navigation and RBAC.

-- MENUS
INSERT INTO rbac_menus (key, label, sort_order)
VALUES
  ('dashboard','Dashboard',1),
  ('reservations','Reservations',2),
  ('rooms','Rooms',3),
  ('finance','Finance',4),
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
  ('settings','settings.rbac','RBAC','/admin/settings/rbac',1),
  ('settings','settings.rbac.users','Users','/admin/settings/rbac/users',2),
  ('settings','settings.rbac.roles','Roles','/admin/settings/rbac/roles',3),
  ('settings','settings.rbac.menus','Menus','/admin/settings/rbac/menus',4),
  ('settings','settings.rbac.submenus','Submenus','/admin/settings/rbac/submenus',5),
  ('settings','settings.rbac.permissions','Permissions','/admin/settings/rbac/permissions',6)
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
  ('payment','CAPTURE','PROPERTY'),
  ('rbac','ADMIN','PROPERTY')
ON CONFLICT DO NOTHING;
