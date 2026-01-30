package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.MenuTreeResponse;
import com.yourorg.hotel.rbac.api.dto.RoleCreateRequest;
import com.yourorg.hotel.rbac.api.dto.RolePermissionsReplaceRequest;
import com.yourorg.hotel.rbac.api.dto.RoleResponse;
import com.yourorg.hotel.rbac.api.dto.RoleSubmenusReplaceRequest;
import com.yourorg.hotel.rbac.api.dto.RoleUpdateRequest;
import com.yourorg.hotel.rbac.application.RbacPickerService;
import com.yourorg.hotel.rbac.application.RbacRoleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rbac/roles")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
@Validated
public class RbacRoleController {
  private final RbacRoleService roleService;
  private final RbacPickerService pickerService;

  public RbacRoleController(RbacRoleService roleService, RbacPickerService pickerService) {
    this.roleService = roleService;
    this.pickerService = pickerService;
  }

  @PostMapping
  public RoleResponse create(@Valid @RequestBody RoleCreateRequest request) {
    return roleService.create(request);
  }

  @GetMapping
  public List<RoleResponse> list() {
    return roleService.list();
  }

  @GetMapping("/{id}")
  public RoleResponse get(@PathVariable UUID id) {
    return roleService.get(id);
  }

  @PutMapping("/{id}")
  public RoleResponse update(@PathVariable UUID id, @Valid @RequestBody RoleUpdateRequest request) {
    return roleService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    roleService.softDelete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/permissions")
  public List<UUID> getPermissions(@PathVariable UUID id) {
    return roleService.getPermissionIds(id);
  }

  @PutMapping("/{id}/permissions")
  public List<UUID> replacePermissions(
      @PathVariable UUID id,
      @RequestBody RolePermissionsReplaceRequest request
  ) {
    return roleService.replacePermissions(id, request);
  }

  @GetMapping("/{id}/submenus")
  public List<MenuTreeResponse> getSubmenus(@PathVariable UUID id) {
    return pickerService.getMenuTreeForRole(id);
  }

  @PutMapping("/{id}/submenus")
  public List<UUID> replaceSubmenus(
      @PathVariable UUID id,
      @RequestBody RoleSubmenusReplaceRequest request
  ) {
    return roleService.replaceSubmenus(id, request);
  }
}
