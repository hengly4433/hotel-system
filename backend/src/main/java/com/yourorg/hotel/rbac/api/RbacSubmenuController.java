package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.SubmenuCreateRequest;
import com.yourorg.hotel.rbac.api.dto.SubmenuResponse;
import com.yourorg.hotel.rbac.api.dto.SubmenuUpdateRequest;
import com.yourorg.hotel.rbac.application.RbacSubmenuService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rbac/submenus")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
@Validated
public class RbacSubmenuController {
  private final RbacSubmenuService submenuService;

  public RbacSubmenuController(RbacSubmenuService submenuService) {
    this.submenuService = submenuService;
  }

  @PostMapping
  public SubmenuResponse create(@Valid @RequestBody SubmenuCreateRequest request) {
    return submenuService.create(request);
  }

  @GetMapping
  public List<SubmenuResponse> list() {
    return submenuService.list();
  }

  @GetMapping("/{id}")
  public SubmenuResponse get(@PathVariable UUID id) {
    return submenuService.get(id);
  }

  @PutMapping("/{id}")
  public SubmenuResponse update(@PathVariable UUID id, @RequestBody SubmenuUpdateRequest request) {
    return submenuService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    submenuService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
