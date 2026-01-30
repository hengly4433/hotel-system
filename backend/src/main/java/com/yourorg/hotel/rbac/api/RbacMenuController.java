package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.MenuCreateRequest;
import com.yourorg.hotel.rbac.api.dto.MenuResponse;
import com.yourorg.hotel.rbac.api.dto.MenuUpdateRequest;
import com.yourorg.hotel.rbac.application.RbacMenuService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rbac/menus")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
@Validated
public class RbacMenuController {
  private final RbacMenuService menuService;

  public RbacMenuController(RbacMenuService menuService) {
    this.menuService = menuService;
  }

  @PostMapping
  public MenuResponse create(@Valid @RequestBody MenuCreateRequest request) {
    return menuService.create(request);
  }

  @GetMapping
  public List<MenuResponse> list() {
    return menuService.list();
  }

  @GetMapping("/{id}")
  public MenuResponse get(@PathVariable UUID id) {
    return menuService.get(id);
  }

  @PutMapping("/{id}")
  public MenuResponse update(@PathVariable UUID id, @Valid @RequestBody MenuUpdateRequest request) {
    return menuService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    menuService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
