-- Grant 'Payroll' submenu to 'ADMIN' role

INSERT INTO role_submenus (role_id, submenu_id)
SELECT r.id, s.id
FROM roles r
CROSS JOIN submenus s
WHERE r.name = 'ADMIN'
  AND s.label = 'Payroll'
  AND s.route = '/admin/reports/payroll'
ON CONFLICT DO NOTHING;
