package com.yourorg.hotel.pricing.api;

import com.yourorg.hotel.pricing.api.dto.CancellationPolicyRequest;
import com.yourorg.hotel.pricing.api.dto.CancellationPolicyResponse;
import com.yourorg.hotel.pricing.application.CancellationPolicyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cancellation-policies")
public class CancellationPolicyController {
  private final CancellationPolicyService cancellationPolicyService;

  public CancellationPolicyController(CancellationPolicyService cancellationPolicyService) {
    this.cancellationPolicyService = cancellationPolicyService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('cancellation_policy.CREATE') or hasAuthority('rbac.ADMIN')")
  public CancellationPolicyResponse create(@Valid @RequestBody CancellationPolicyRequest request) {
    return cancellationPolicyService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('cancellation_policy.READ') or hasAuthority('rbac.ADMIN')")
  public List<CancellationPolicyResponse> list() {
    return cancellationPolicyService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('cancellation_policy.READ') or hasAuthority('rbac.ADMIN')")
  public CancellationPolicyResponse get(@PathVariable UUID id) {
    return cancellationPolicyService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('cancellation_policy.UPDATE') or hasAuthority('rbac.ADMIN')")
  public CancellationPolicyResponse update(
      @PathVariable UUID id,
      @Valid @RequestBody CancellationPolicyRequest request
  ) {
    return cancellationPolicyService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('cancellation_policy.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    cancellationPolicyService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
