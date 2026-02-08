package com.blockcode.hotel.auth.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.auth.api.dto.MenuTreeResponse;
import com.blockcode.hotel.auth.api.dto.MenuTreeSubmenuResponse;
import com.blockcode.hotel.auth.api.dto.PermissionGroupResponse;
import com.blockcode.hotel.auth.api.dto.PermissionResponse;
import com.blockcode.hotel.auth.api.mapper.PermissionMapper;
import com.blockcode.hotel.auth.domain.MenuEntity;
import com.blockcode.hotel.auth.domain.PermissionEntity;
import com.blockcode.hotel.auth.domain.SubmenuEntity;
import com.blockcode.hotel.auth.infra.MenuRepository;
import com.blockcode.hotel.auth.infra.PermissionRepository;
import com.blockcode.hotel.auth.infra.RoleRepository;
import com.blockcode.hotel.auth.infra.RoleSubmenuRepository;
import com.blockcode.hotel.auth.infra.SubmenuRepository;
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
public class PickerService {
  private final PermissionRepository permissionRepository;
  private final MenuRepository menuRepository;
  private final SubmenuRepository submenuRepository;
  private final RoleSubmenuRepository roleSubmenuRepository;
  private final RoleRepository roleRepository;
  private final PermissionMapper permissionMapper;

  public PickerService(
      PermissionRepository permissionRepository,
      MenuRepository menuRepository,
      SubmenuRepository submenuRepository,
      RoleSubmenuRepository roleSubmenuRepository,
      RoleRepository roleRepository,
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
    List<PermissionEntity> permissions = permissionRepository.findAllByDeletedAtIsNullOrderByResourceAscActionAsc();
    Map<String, List<PermissionResponse>> grouped = new HashMap<>();

    for (PermissionEntity permission : permissions) {
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
    List<MenuEntity> menus = menuRepository.findAllByDeletedAtIsNullOrderBySortOrderAscLabelAsc();
    List<SubmenuEntity> submenus = submenuRepository.findAllByDeletedAtIsNullOrderByMenuIdAscSortOrderAsc();

    Map<UUID, List<SubmenuEntity>> submenusByMenu = new HashMap<>();
    for (SubmenuEntity submenu : submenus) {
      submenusByMenu.computeIfAbsent(submenu.getMenuId(), k -> new ArrayList<>()).add(submenu);
    }

    List<MenuTreeResponse> result = new ArrayList<>();
    for (MenuEntity menu : menus) {
      List<SubmenuEntity> menuSubmenus = submenusByMenu.getOrDefault(menu.getId(), List.of());
      List<MenuTreeSubmenuResponse> subtree = menuSubmenus.stream()
          .sorted(Comparator.comparing(SubmenuEntity::getSortOrder))
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
