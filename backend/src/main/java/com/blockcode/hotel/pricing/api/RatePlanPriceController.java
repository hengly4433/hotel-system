package com.blockcode.hotel.pricing.api;

import com.blockcode.hotel.pricing.api.dto.RatePlanPriceRequest;
import com.blockcode.hotel.pricing.api.dto.RatePlanPriceResponse;
import com.blockcode.hotel.pricing.application.RatePlanPriceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rate-plan-prices")
public class RatePlanPriceController {
  private final RatePlanPriceService ratePlanPriceService;

  public RatePlanPriceController(RatePlanPriceService ratePlanPriceService) {
    this.ratePlanPriceService = ratePlanPriceService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('rate_plan_price.CREATE') or hasAuthority('rbac.ADMIN')")
  public RatePlanPriceResponse create(@Valid @RequestBody RatePlanPriceRequest request) {
    return ratePlanPriceService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('rate_plan_price.READ') or hasAuthority('rbac.ADMIN')")
  public List<RatePlanPriceResponse> list(
      @RequestParam(required = false) UUID ratePlanId,
      @RequestParam(required = false) UUID roomTypeId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
  ) {
    return ratePlanPriceService.list(ratePlanId, roomTypeId, from, to);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('rate_plan_price.READ') or hasAuthority('rbac.ADMIN')")
  public RatePlanPriceResponse get(@PathVariable UUID id) {
    return ratePlanPriceService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('rate_plan_price.UPDATE') or hasAuthority('rbac.ADMIN')")
  public RatePlanPriceResponse update(@PathVariable UUID id, @Valid @RequestBody RatePlanPriceRequest request) {
    return ratePlanPriceService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('rate_plan_price.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    ratePlanPriceService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
