-- Add 'Payroll' submenu to 'Reports' menu

INSERT INTO submenus (id, menu_id, key, label, route, sort_order)
SELECT 
  gen_random_uuid(), 
  m.id, 
  'reports.payroll',
  'Payroll', 
  '/admin/reports/payroll', 
  5
FROM menus m
WHERE m.key = 'reports'
AND NOT EXISTS (
    SELECT 1 FROM submenus s 
    WHERE s.menu_id = m.id AND s.label = 'Payroll'
);
