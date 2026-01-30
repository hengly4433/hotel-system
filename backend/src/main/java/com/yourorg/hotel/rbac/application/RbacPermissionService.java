package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.PermissionCreateRequest;
import com.yourorg.hotel.rbac.api.dto.PermissionResponse;
import com.yourorg.hotel.rbac.api.dto.PermissionUpdateRequest;
import com.yourorg.hotel.rbac.api.mapper.PermissionMapper;
import com.yourorg.hotel.rbac.domain.RbacPermissionEntity;
import com.yourorg.hotel.rbac.infra.RbacPermissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
public class RbacPermissionService {
  private final RbacPermissionRepository permissionRepository;
  private final PermissionMapper permissionMapper;

  public RbacPermissionService(RbacPermissionRepository permissionRepository, PermissionMapper permissionMapper) {
    this.permissionRepository = permissionRepository;
    this.permissionMapper = permissionMapper;
  }

  public PermissionResponse create(PermissionCreateRequest request) {
    if (permissionRepository.existsActive(request.resource(), request.action(), request.scope())) {
      throw new AppException("PERMISSION_EXISTS", "Permission already exists", HttpStatus.BAD_REQUEST);
    }

    RbacPermissionEntity permission = new RbacPermissionEntity();
    permission.setResource(request.resource());
    permission.setAction(request.action());
    permission.setScope(request.scope());

    permissionRepository.save(permission);
    return permissionMapper.toResponse(permission);
  }

  @Transactional(readOnly = true)
  public List<PermissionResponse> list() {
    return permissionRepository.findAllByDeletedAtIsNullOrderByResourceAscActionAsc()
        .stream()
        .map(permissionMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public PermissionResponse get(UUID id) {
    RbacPermissionEntity permission = permissionRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Permission not found", HttpStatus.NOT_FOUND));
    return permissionMapper.toResponse(permission);
  }

  public PermissionResponse update(UUID id, PermissionUpdateRequest request) {
    RbacPermissionEntity permission = permissionRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Permission not found", HttpStatus.NOT_FOUND));

    boolean changed = !Objects.equals(permission.getResource(), request.resource())
        || !Objects.equals(permission.getAction(), request.action())
        || !Objects.equals(permission.getScope(), request.scope());

    if (changed && permissionRepository.existsActive(request.resource(), request.action(), request.scope())) {
      throw new AppException("PERMISSION_EXISTS", "Permission already exists", HttpStatus.BAD_REQUEST);
    }

    permission.setResource(request.resource());
    permission.setAction(request.action());
    permission.setScope(request.scope());

    permissionRepository.save(permission);
    return permissionMapper.toResponse(permission);
  }

  public void softDelete(UUID id) {
    RbacPermissionEntity permission = permissionRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Permission not found", HttpStatus.NOT_FOUND));
    permission.setDeletedAt(Instant.now());
    permissionRepository.save(permission);
  }
}
