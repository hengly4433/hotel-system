-- Soft-delete the "Create Reservation" submenu from sidebar
UPDATE submenus 
SET deleted_at = NOW() 
WHERE key = 'reservations.create' AND deleted_at IS NULL;
