package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.MenuTreeResponse;
import com.yourorg.hotel.rbac.api.dto.MenuTreeSubmenuResponse;
import com.yourorg.hotel.rbac.api.dto.PermissionGroupResponse;
import com.yourorg.hotel.rbac.api.dto.PermissionResponse;
import com.yourorg.hotel.rbac.api.mapper.PermissionMapper;
import com.yourorg.hotel.rbac.domain.RbacMenuEntity;
import com.yourorg.hotel.rbac.domain.RbacPermissionEntity;
import com.yourorg.hotel.rbac.domain.RbacSubmenuEntity;
import com.yourorg.hotel.rbac.infra.RbacMenuRepository;
import com.yourorg.hotel.rbac.infra.RbacPermissionRepository;
import com.yourorg.hotel.rbac.infra.RbacRoleRepository;
import com.yourorg.hotel.rbac.infra.RbacRoleSubmenuRepository;
import com.yourorg.hotel.rbac.infra.RbacSubmenuRepository;
import org.springframework.http.HttpStatus;
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
public class RbacPickerService {
  private final RbacPermissionRepository permissionRepository;
  private final RbacMenuRepository menuRepository;
  private final RbacSubmenuRepository submenuRepository;
  private final RbacRoleSubmenuRepository roleSubmenuRepository;
  private final RbacRoleRepository roleRepository;
  private final PermissionMapper permissionMapper;

  public RbacPickerService(
      RbacPermissionRepository permissionRepository,
      RbacMenuRepository menuRepository,
      RbacSubmenuRepository submenuRepository,
      RbacRoleSubmenuRepository roleSubmenuRepository,
      RbacRoleRepository roleRepository,
      PermissionMapper permissionMapper
  ) {
    this.permissionRepository = permissionRepository;
    this.menuRepository = menuRepository;
    this.submenuRepository = submenuRepository;
    this.roleSubmenuRepository = roleSubmenuRepository;
    this.roleRepository = roleRepository;
    this.permissionMapper = permissionMapper;
  }

  public List<PermissionGroupResponse> getPermissionsGrouped() {
    List<RbacPermissionEntity> permissions = permissionRepository.findAllByDeletedAtIsNullOrderByResourceAscActionAsc();
    Map<String, List<PermissionResponse>> grouped = new HashMap<>();

    for (RbacPermissionEntity permission : permissions) {
      grouped.computeIfAbsent(permission.getResource(), k -> new ArrayList<>())
          .add(permissionMapper.toResponse(permission));
    }

    return grouped.entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(entry -> new PermissionGroupResponse(entry.getKey(), entry.getValue()))
        .toList();
  }

  public List<MenuTreeResponse> getMenuTree() {
    return buildMenuTree(Set.of());
  }

  public List<MenuTreeResponse> getMenuTreeForRole(UUID roleId) {
    roleRepository.findByIdAndDeletedAtIsNull(roleId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND));

    Set<UUID> checked = roleSubmenuRepository.findSubmenuIdsByRoleId(roleId).stream().collect(Collectors.toSet());
    return buildMenuTree(checked);
  }

  private List<MenuTreeResponse> buildMenuTree(Set<UUID> checkedSubmenus) {
    List<RbacMenuEntity> menus = menuRepository.findAllByDeletedAtIsNullOrderBySortOrderAscLabelAsc();
    List<RbacSubmenuEntity> submenus = submenuRepository.findAllByDeletedAtIsNullOrderByMenuIdAscSortOrderAsc();

    Map<UUID, List<RbacSubmenuEntity>> submenusByMenu = new HashMap<>();
    for (RbacSubmenuEntity submenu : submenus) {
      submenusByMenu.computeIfAbsent(submenu.getMenuId(), k -> new ArrayList<>()).add(submenu);
    }

    List<MenuTreeResponse> result = new ArrayList<>();
    for (RbacMenuEntity menu : menus) {
      List<RbacSubmenuEntity> menuSubmenus = submenusByMenu.getOrDefault(menu.getId(), List.of());
      List<MenuTreeSubmenuResponse> subtree = menuSubmenus.stream()
          .sorted(Comparator.comparing(RbacSubmenuEntity::getSortOrder))
          .map(sm -> new MenuTreeSubmenuResponse(
              sm.getId(),
              sm.getKey(),
              sm.getLabel(),
              sm.getRoute(),
              sm.getSortOrder(),
              checkedSubmenus.contains(sm.getId())
          ))
          .toList();

      result.add(new MenuTreeResponse(
          menu.getId(),
          menu.getKey(),
          menu.getLabel(),
          menu.getSortOrder(),
          subtree
      ));
    }

    return result;
  }
}
