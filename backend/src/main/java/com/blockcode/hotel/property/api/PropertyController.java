package com.blockcode.hotel.property.api;

import com.blockcode.hotel.property.api.dto.PropertyRequest;
import com.blockcode.hotel.property.api.dto.PropertyResponse;
import com.blockcode.hotel.property.application.PropertyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/properties")
@Validated
public class PropertyController {
  private final PropertyService propertyService;

  public PropertyController(PropertyService propertyService) {
    this.propertyService = propertyService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('property.CREATE') or hasAuthority('rbac.ADMIN')")
  public PropertyResponse create(@Valid @RequestBody PropertyRequest request) {
    return propertyService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('property.READ') or hasAuthority('rbac.ADMIN')")
  public List<PropertyResponse> list() {
    return propertyService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('property.READ') or hasAuthority('rbac.ADMIN')")
  public PropertyResponse get(@PathVariable UUID id) {
    return propertyService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('property.UPDATE') or hasAuthority('rbac.ADMIN')")
  public PropertyResponse update(@PathVariable UUID id, @Valid @RequestBody PropertyRequest request) {
    return propertyService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('property.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    propertyService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
