package com.blockcode.hotel.auth.api;

import com.blockcode.hotel.auth.api.dto.MenuTreeResponse;
import com.blockcode.hotel.auth.api.dto.RoleCreateRequest;
import com.blockcode.hotel.auth.api.dto.RolePermissionsReplaceRequest;
import com.blockcode.hotel.auth.api.dto.RoleResponse;
import com.blockcode.hotel.auth.api.dto.RoleSubmenusReplaceRequest;
import com.blockcode.hotel.auth.api.dto.RoleUpdateRequest;
import com.blockcode.hotel.auth.application.PickerService;
import com.blockcode.hotel.auth.application.RoleService;
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
public class RoleController {
  private final RoleService roleService;
  private final PickerService pickerService;

  public RoleController(RoleService roleService, PickerService pickerService) {
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
