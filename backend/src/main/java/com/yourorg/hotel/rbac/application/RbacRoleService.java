package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.RoleCreateRequest;
import com.yourorg.hotel.rbac.api.dto.RolePermissionsReplaceRequest;
import com.yourorg.hotel.rbac.api.dto.RoleResponse;
import com.yourorg.hotel.rbac.api.dto.RoleSubmenusReplaceRequest;
import com.yourorg.hotel.rbac.api.dto.RoleUpdateRequest;
import com.yourorg.hotel.rbac.api.mapper.RoleMapper;
import com.yourorg.hotel.rbac.domain.RbacRoleEntity;
import com.yourorg.hotel.rbac.domain.RbacRolePermissionEntity;
import com.yourorg.hotel.rbac.domain.RbacRolePermissionId;
import com.yourorg.hotel.rbac.domain.RbacRoleSubmenuEntity;
import com.yourorg.hotel.rbac.domain.RbacRoleSubmenuId;
import com.yourorg.hotel.rbac.infra.RbacPermissionRepository;
import com.yourorg.hotel.rbac.infra.RbacRolePermissionRepository;
import com.yourorg.hotel.rbac.infra.RbacRoleRepository;
import com.yourorg.hotel.rbac.infra.RbacRoleSubmenuRepository;
import com.yourorg.hotel.rbac.infra.RbacSubmenuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RbacRoleService {
  private final RbacRoleRepository roleRepository;
  private final RbacPermissionRepository permissionRepository;
  private final RbacSubmenuRepository submenuRepository;
  private final RbacRolePermissionRepository rolePermissionRepository;
  private final RbacRoleSubmenuRepository roleSubmenuRepository;
  private final RoleMapper roleMapper;

  public RbacRoleService(
      RbacRoleRepository roleRepository,
      RbacPermissionRepository permissionRepository,
      RbacSubmenuRepository submenuRepository,
      RbacRolePermissionRepository rolePermissionRepository,
      RbacRoleSubmenuRepository roleSubmenuRepository,
      RoleMapper roleMapper
  ) {
    this.roleRepository = roleRepository;
    this.permissionRepository = permissionRepository;
    this.submenuRepository = submenuRepository;
    this.rolePermissionRepository = rolePermissionRepository;
    this.roleSubmenuRepository = roleSubmenuRepository;
    this.roleMapper = roleMapper;
  }

  public RoleResponse create(RoleCreateRequest request) {
    validateUniqueName(request.propertyId(), request.name(), null);

    RbacRoleEntity role = new RbacRoleEntity();
    role.setName(request.name());
    role.setPropertyId(request.propertyId());

    roleRepository.save(role);
    return roleMapper.toResponse(role);
  }

  @Transactional(readOnly = true)
  public List<RoleResponse> list() {
    return roleRepository.findAllByDeletedAtIsNullOrderByNameAsc()
        .stream()
        .map(roleMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public RoleResponse get(UUID id) {
    RbacRoleEntity role = roleRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND));
    return roleMapper.toResponse(role);
  }

  public RoleResponse update(UUID id, RoleUpdateRequest request) {
    RbacRoleEntity role = roleRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND));

    UUID effectivePropertyId = request.propertyId() != null ? request.propertyId() : role.getPropertyId();
    validateUniqueName(effectivePropertyId, request.name(), id);

    role.setName(request.name());
    if (request.propertyId() != null) {
      role.setPropertyId(request.propertyId());
    }

    roleRepository.save(role);
    return roleMapper.toResponse(role);
  }

  public void softDelete(UUID id) {
    RbacRoleEntity role = roleRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND));
    role.setDeletedAt(Instant.now());
    roleRepository.save(role);
  }

  @Transactional(readOnly = true)
  public List<UUID> getPermissionIds(UUID roleId) {
    roleRepository.findByIdAndDeletedAtIsNull(roleId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND));
    return rolePermissionRepository.findPermissionIdsByRoleId(roleId);
  }

  public List<UUID> replacePermissions(UUID roleId, RolePermissionsReplaceRequest request) {
    roleRepository.findByIdAndDeletedAtIsNull(roleId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND));

    List<UUID> permissionIds = normalizeIds(request.permissionIds());
    if (!permissionIds.isEmpty()) {
      long count = permissionRepository.countByIdInAndDeletedAtIsNull(permissionIds);
      if (count != permissionIds.size()) {
        throw new AppException("PERMISSION_NOT_FOUND", "One or more permissions do not exist", HttpStatus.BAD_REQUEST);
      }
    }

    rolePermissionRepository.deleteByRoleId(roleId);

    if (!permissionIds.isEmpty()) {
      List<RbacRolePermissionEntity> mappings = permissionIds.stream()
          .distinct()
          .map(pid -> new RbacRolePermissionEntity(new RbacRolePermissionId(roleId, pid)))
          .toList();
      rolePermissionRepository.saveAll(mappings);
    }

    return permissionIds;
  }

  @Transactional(readOnly = true)
  public List<UUID> getSubmenuIds(UUID roleId) {
    roleRepository.findByIdAndDeletedAtIsNull(roleId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND));
    return roleSubmenuRepository.findSubmenuIdsByRoleId(roleId);
  }

  public List<UUID> replaceSubmenus(UUID roleId, RoleSubmenusReplaceRequest request) {
    roleRepository.findByIdAndDeletedAtIsNull(roleId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found", HttpStatus.NOT_FOUND));

    List<UUID> submenuIds = normalizeIds(request.submenuIds());
    if (!submenuIds.isEmpty()) {
      long count = submenuRepository.countByIdInAndDeletedAtIsNull(submenuIds);
      if (count != submenuIds.size()) {
        throw new AppException("SUBMENU_NOT_FOUND", "One or more submenus do not exist", HttpStatus.BAD_REQUEST);
      }
    }

    roleSubmenuRepository.deleteByRoleId(roleId);

    if (!submenuIds.isEmpty()) {
      List<RbacRoleSubmenuEntity> mappings = submenuIds.stream()
          .distinct()
          .map(sid -> new RbacRoleSubmenuEntity(new RbacRoleSubmenuId(roleId, sid)))
          .toList();
      roleSubmenuRepository.saveAll(mappings);
    }

    return submenuIds;
  }

  private void validateUniqueName(UUID propertyId, String name, UUID currentId) {
    Optional<RbacRoleEntity> existing = roleRepository.findByPropertyIdAndNameAndDeletedAtIsNull(propertyId, name);
    if (existing.isPresent() && (currentId == null || !existing.get().getId().equals(currentId))) {
      throw new AppException("ROLE_EXISTS", "Role name already exists", HttpStatus.BAD_REQUEST);
    }
  }

  private List<UUID> normalizeIds(List<UUID> ids) {
    if (ids == null) {
      return Collections.emptyList();
    }
    return ids.stream().distinct().toList();
  }
}
