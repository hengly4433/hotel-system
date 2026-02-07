package com.blockcode.hotel.pricing.api;

import com.blockcode.hotel.pricing.api.dto.RatePlanRequest;
import com.blockcode.hotel.pricing.api.dto.RatePlanResponse;
import com.blockcode.hotel.pricing.application.RatePlanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rate-plans")
public class RatePlanController {
  private final RatePlanService ratePlanService;

  public RatePlanController(RatePlanService ratePlanService) {
    this.ratePlanService = ratePlanService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('rate_plan.CREATE') or hasAuthority('rbac.ADMIN')")
  public RatePlanResponse create(@Valid @RequestBody RatePlanRequest request) {
    return ratePlanService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('rate_plan.READ') or hasAuthority('rbac.ADMIN')")
  public List<RatePlanResponse> list() {
    return ratePlanService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('rate_plan.READ') or hasAuthority('rbac.ADMIN')")
  public RatePlanResponse get(@PathVariable UUID id) {
    return ratePlanService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('rate_plan.UPDATE') or hasAuthority('rbac.ADMIN')")
  public RatePlanResponse update(@PathVariable UUID id, @Valid @RequestBody RatePlanRequest request) {
    return ratePlanService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('rate_plan.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    ratePlanService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
