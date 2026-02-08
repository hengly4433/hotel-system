package com.blockcode.hotel.auth.application;

import com.blockcode.hotel.common.security.CurrentUserProvider;
import com.blockcode.hotel.auth.api.dto.NavigationMenuResponse;
import com.blockcode.hotel.auth.api.dto.NavigationSubmenuResponse;
import com.blockcode.hotel.auth.domain.MenuEntity;
import com.blockcode.hotel.auth.domain.SubmenuEntity;
import com.blockcode.hotel.auth.infra.MenuRepository;
import com.blockcode.hotel.auth.infra.RoleSubmenuRepository;
import com.blockcode.hotel.auth.infra.SubmenuRepository;
import com.blockcode.hotel.auth.infra.UserRoleRepository;
import com.blockcode.hotel.auth.infra.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class NavigationService {
  private final CurrentUserProvider currentUserProvider;
  private final UserRoleRepository userRoleRepository;
  private final UserRepository userRepository;
  private final RoleSubmenuRepository roleSubmenuRepository;
  private final SubmenuRepository submenuRepository;
  private final MenuRepository menuRepository;

  public NavigationService(
      CurrentUserProvider currentUserProvider,
      UserRoleRepository userRoleRepository,
      UserRepository userRepository,
      RoleSubmenuRepository roleSubmenuRepository,
      SubmenuRepository submenuRepository,
      MenuRepository menuRepository) {
    this.currentUserProvider = currentUserProvider;
    this.userRoleRepository = userRoleRepository;
    this.userRepository = userRepository;
    this.roleSubmenuRepository = roleSubmenuRepository;
    this.submenuRepository = submenuRepository;
    this.menuRepository = menuRepository;
  }

  public List<NavigationMenuResponse> getCurrentNavigation() {
    UUID userId = currentUserProvider.getRequiredUserId();
    return getNavigationForUser(userId);
  }

  public List<NavigationMenuResponse> getNavigationForUser(UUID userId) {
    // 1. Check if System Admin
    var userOpt = userRepository.findByIdAndDeletedAtIsNull(userId);
    if (userOpt.isPresent() && "systemadmin@hotel.com".equalsIgnoreCase(userOpt.get().getEmail())) {
      // Return ALL menus
      List<SubmenuEntity> allSubmenus = submenuRepository.findAllByDeletedAtIsNullOrderByMenuIdAscSortOrderAsc();
      Map<UUID, List<SubmenuEntity>> submenusByMenu = new HashMap<>();
      for (SubmenuEntity submenu : allSubmenus) {
        submenusByMenu.computeIfAbsent(submenu.getMenuId(), k -> new ArrayList<>()).add(submenu);
      }
      List<MenuEntity> allMenus = menuRepository.findAllByDeletedAtIsNullOrderBySortOrderAscLabelAsc();
      return mapMenus(allMenus, submenusByMenu);
    }

    List<UUID> roleIds = userRoleRepository.findRoleIdsByUserId(userId);
    if (roleIds.isEmpty()) {
      return List.of();
    }

    Set<UUID> submenuIds = roleSubmenuRepository.findSubmenuIdsByRoleIds(roleIds)
        .stream()
        .collect(Collectors.toSet());

    if (submenuIds.isEmpty()) {
      return List.of();
    }

    List<SubmenuEntity> submenus = submenuRepository.findByIdInAndDeletedAtIsNull(submenuIds);
    Map<UUID, List<SubmenuEntity>> submenusByMenu = new HashMap<>();
    for (SubmenuEntity submenu : submenus) {
      submenusByMenu.computeIfAbsent(submenu.getMenuId(), k -> new ArrayList<>()).add(submenu);
    }

    List<MenuEntity> menus = menuRepository.findByIdInAndDeletedAtIsNull(submenusByMenu.keySet());

    return mapMenus(menus, submenusByMenu);
  }

  private List<NavigationMenuResponse> mapMenus(List<MenuEntity> menus,
      Map<UUID, List<SubmenuEntity>> submenusByMenu) {
    return menus.stream()
        .sorted(Comparator.comparing(MenuEntity::getSortOrder))
        .map(menu -> {
          List<NavigationSubmenuResponse> navSubmenus = submenusByMenu
              .getOrDefault(menu.getId(), List.of())
              .stream()
              .sorted(Comparator.comparing(SubmenuEntity::getSortOrder))
              .map(sm -> new NavigationSubmenuResponse(
                  sm.getId(),
                  sm.getKey(),
                  sm.getLabel(),
                  sm.getRoute(),
                  sm.getSortOrder()))
              .toList();

          return new NavigationMenuResponse(
              menu.getId(),
              menu.getKey(),
              menu.getLabel(),
              menu.getSortOrder(),
              navSubmenus);
        })
        .toList();
  }
}
