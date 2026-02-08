package com.blockcode.hotel.pricing.api;

import com.blockcode.hotel.pricing.api.dto.TaxFeeRequest;
import com.blockcode.hotel.pricing.api.dto.TaxFeeResponse;
import com.blockcode.hotel.pricing.application.TaxFeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/taxes-fees")
public class TaxFeeController {
  private final TaxFeeService taxFeeService;

  public TaxFeeController(TaxFeeService taxFeeService) {
    this.taxFeeService = taxFeeService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('tax_fee.CREATE') or hasAuthority('rbac.ADMIN')")
  public TaxFeeResponse create(@Valid @RequestBody TaxFeeRequest request) {
    return taxFeeService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('tax_fee.READ') or hasAuthority('rbac.ADMIN')")
  public List<TaxFeeResponse> list() {
    return taxFeeService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('tax_fee.READ') or hasAuthority('rbac.ADMIN')")
  public TaxFeeResponse get(@PathVariable UUID id) {
    return taxFeeService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('tax_fee.UPDATE') or hasAuthority('rbac.ADMIN')")
  public TaxFeeResponse update(@PathVariable UUID id, @Valid @RequestBody TaxFeeRequest request) {
    return taxFeeService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('tax_fee.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    taxFeeService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
