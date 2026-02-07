package com.blockcode.hotel.organization.api;

import com.blockcode.hotel.organization.api.dto.OrganizationRequest;
import com.blockcode.hotel.organization.api.dto.OrganizationResponse;
import com.blockcode.hotel.organization.application.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@Validated
public class OrganizationController {
  private final OrganizationService organizationService;

  public OrganizationController(OrganizationService organizationService) {
    this.organizationService = organizationService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('organization.CREATE') or hasAuthority('rbac.ADMIN')")
  public OrganizationResponse create(@Valid @RequestBody OrganizationRequest request) {
    return organizationService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('organization.READ') or hasAuthority('rbac.ADMIN')")
  public List<OrganizationResponse> list() {
    return organizationService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('organization.READ') or hasAuthority('rbac.ADMIN')")
  public OrganizationResponse get(@PathVariable UUID id) {
    return organizationService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('organization.UPDATE') or hasAuthority('rbac.ADMIN')")
  public OrganizationResponse update(@PathVariable UUID id, @Valid @RequestBody OrganizationRequest request) {
    return organizationService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('organization.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    organizationService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
