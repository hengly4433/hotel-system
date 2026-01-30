package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.security.CurrentUserProvider;
import com.yourorg.hotel.rbac.api.dto.NavigationMenuResponse;
import com.yourorg.hotel.rbac.api.dto.NavigationSubmenuResponse;
import com.yourorg.hotel.rbac.domain.RbacMenuEntity;
import com.yourorg.hotel.rbac.domain.RbacSubmenuEntity;
import com.yourorg.hotel.rbac.infra.RbacMenuRepository;
import com.yourorg.hotel.rbac.infra.RbacRoleSubmenuRepository;
import com.yourorg.hotel.rbac.infra.RbacSubmenuRepository;
import com.yourorg.hotel.rbac.infra.RbacUserRoleRepository;
import com.yourorg.hotel.rbac.infra.RbacUserRepository;
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
public class RbacNavigationService {
  private final CurrentUserProvider currentUserProvider;
  private final RbacUserRoleRepository userRoleRepository;
  private final RbacUserRepository userRepository;
  private final RbacRoleSubmenuRepository roleSubmenuRepository;
  private final RbacSubmenuRepository submenuRepository;
  private final RbacMenuRepository menuRepository;

  public RbacNavigationService(
      CurrentUserProvider currentUserProvider,
      RbacUserRoleRepository userRoleRepository,
      RbacUserRepository userRepository,
      RbacRoleSubmenuRepository roleSubmenuRepository,
      RbacSubmenuRepository submenuRepository,
      RbacMenuRepository menuRepository) {
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
      List<RbacSubmenuEntity> allSubmenus = submenuRepository.findAllByDeletedAtIsNullOrderByMenuIdAscSortOrderAsc();
      Map<UUID, List<RbacSubmenuEntity>> submenusByMenu = new HashMap<>();
      for (RbacSubmenuEntity submenu : allSubmenus) {
        submenusByMenu.computeIfAbsent(submenu.getMenuId(), k -> new ArrayList<>()).add(submenu);
      }
      List<RbacMenuEntity> allMenus = menuRepository.findAllByDeletedAtIsNullOrderBySortOrderAscLabelAsc();
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

    List<RbacSubmenuEntity> submenus = submenuRepository.findByIdInAndDeletedAtIsNull(submenuIds);
    Map<UUID, List<RbacSubmenuEntity>> submenusByMenu = new HashMap<>();
    for (RbacSubmenuEntity submenu : submenus) {
      submenusByMenu.computeIfAbsent(submenu.getMenuId(), k -> new ArrayList<>()).add(submenu);
    }

    List<RbacMenuEntity> menus = menuRepository.findByIdInAndDeletedAtIsNull(submenusByMenu.keySet());

    return mapMenus(menus, submenusByMenu);
  }

  private List<NavigationMenuResponse> mapMenus(List<RbacMenuEntity> menus,
      Map<UUID, List<RbacSubmenuEntity>> submenusByMenu) {
    return menus.stream()
        .sorted(Comparator.comparing(RbacMenuEntity::getSortOrder))
        .map(menu -> {
          List<NavigationSubmenuResponse> navSubmenus = submenusByMenu
              .getOrDefault(menu.getId(), List.of())
              .stream()
              .sorted(Comparator.comparing(RbacSubmenuEntity::getSortOrder))
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
