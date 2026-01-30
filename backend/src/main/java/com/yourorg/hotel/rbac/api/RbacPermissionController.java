package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.PermissionCreateRequest;
import com.yourorg.hotel.rbac.api.dto.PermissionResponse;
import com.yourorg.hotel.rbac.api.dto.PermissionUpdateRequest;
import com.yourorg.hotel.rbac.application.RbacPermissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rbac/permissions")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
@Validated
public class RbacPermissionController {
  private final RbacPermissionService permissionService;

  public RbacPermissionController(RbacPermissionService permissionService) {
    this.permissionService = permissionService;
  }

  @PostMapping
  public PermissionResponse create(@Valid @RequestBody PermissionCreateRequest request) {
    return permissionService.create(request);
  }

  @GetMapping
  public List<PermissionResponse> list() {
    return permissionService.list();
  }

  @GetMapping("/{id}")
  public PermissionResponse get(@PathVariable UUID id) {
    return permissionService.get(id);
  }

  @PutMapping("/{id}")
  public PermissionResponse update(@PathVariable UUID id, @Valid @RequestBody PermissionUpdateRequest request) {
    return permissionService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    permissionService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
