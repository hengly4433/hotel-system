package com.blockcode.hotel.content.infra;

import com.blockcode.hotel.auth.domain.MenuEntity;
import com.blockcode.hotel.auth.domain.SubmenuEntity;
import com.blockcode.hotel.auth.infra.MenuRepository;
import com.blockcode.hotel.auth.infra.SubmenuRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@Order(100)
public class ContentDataInitializer implements CommandLineRunner {

    private final MenuRepository menuRepository;
    private final SubmenuRepository submenuRepository;

    public ContentDataInitializer(MenuRepository menuRepository, SubmenuRepository submenuRepository) {
        this.menuRepository = menuRepository;
        this.submenuRepository = submenuRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        createContentMenu();
    }

    private void createContentMenu() {
        // 1. Create or Get "Content" Menu
        String menuKey = "content";
        MenuEntity contentMenu = menuRepository.findByKeyAndDeletedAtIsNull(menuKey)
                .orElseGet(() -> {
                    MenuEntity menu = new MenuEntity();
                    menu.setKey(menuKey);
                    menu.setLabel("Content");
                    menu.setSortOrder(25); // Position it appropriately
                    return menuRepository.save(menu);
                });

        // 2. Create "Blogs" Submenu
        createSubmenu(contentMenu, "blogs", "Blogs", "/admin/content/blogs", 1);

        // 3. Create "Sections" Submenu
        createSubmenu(contentMenu, "sections", "Section Content", "/admin/content/sections", 2);
    }

    private void createSubmenu(MenuEntity menu, String key, String label, String route, int sortOrder) {
        Optional<SubmenuEntity> existing = submenuRepository.findByMenuIdAndKeyAndDeletedAtIsNull(menu.getId(), key);
        if (existing.isEmpty()) {
            SubmenuEntity submenu = new SubmenuEntity();
            submenu.setMenuId(menu.getId());
            submenu.setKey(key);
            submenu.setLabel(label);
            submenu.setRoute(route);
            submenu.setSortOrder(sortOrder);
            submenuRepository.save(submenu);
        }
    }
}
