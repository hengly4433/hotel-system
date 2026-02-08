package com.blockcode.hotel.reservation.infra;

import com.blockcode.hotel.auth.domain.SubmenuEntity;
import com.blockcode.hotel.auth.infra.MenuRepository;
import com.blockcode.hotel.auth.infra.SubmenuRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

/**
 * This initializer runs on startup to clean up unwanted menu items.
 * It soft-deletes the "Create Reservation" submenu since reservations
 * should only be created via the "New Reservation" button on the Reservations page.
 */
@Component
@Order(110)
public class MenuCleanupInitializer implements CommandLineRunner {

    private final MenuRepository menuRepository;
    private final SubmenuRepository submenuRepository;

    public MenuCleanupInitializer(MenuRepository menuRepository, SubmenuRepository submenuRepository) {
        this.menuRepository = menuRepository;
        this.submenuRepository = submenuRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        cleanupReservationSubmenus();
    }

    private void cleanupReservationSubmenus() {
        // Find the reservations menu
        menuRepository.findByKeyAndDeletedAtIsNull("reservations").ifPresent(reservationsMenu -> {
            // Soft-delete the "Create Reservation" submenu
            softDeleteSubmenu(reservationsMenu.getId(), "reservations.create");
        });
    }

    private void softDeleteSubmenu(java.util.UUID menuId, String submenuKey) {
        Optional<SubmenuEntity> submenu = submenuRepository.findByMenuIdAndKeyAndDeletedAtIsNull(menuId, submenuKey);
        submenu.ifPresent(entity -> {
            entity.setDeletedAt(Instant.now());
            submenuRepository.save(entity);
        });
    }
}
