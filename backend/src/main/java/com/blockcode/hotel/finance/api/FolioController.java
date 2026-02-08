package com.blockcode.hotel.finance.api;

import com.blockcode.hotel.finance.api.dto.FolioDetailResponse;
import com.blockcode.hotel.finance.api.dto.FolioItemCreateRequest;
import com.blockcode.hotel.finance.api.dto.FolioItemResponse;
import com.blockcode.hotel.finance.api.dto.FolioSummaryResponse;
import com.blockcode.hotel.finance.api.dto.PaymentCreateRequest;
import com.blockcode.hotel.finance.api.dto.PaymentResponse;
import com.blockcode.hotel.finance.application.FolioService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/folios")
@Validated
public class FolioController {
  private final FolioService folioService;

  public FolioController(FolioService folioService) {
    this.folioService = folioService;
  }

  @GetMapping
  @PreAuthorize("hasAuthority('folio.READ') or hasAuthority('rbac.ADMIN')")
  public List<FolioSummaryResponse> list() {
    return folioService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('folio.READ') or hasAuthority('rbac.ADMIN')")
  public FolioDetailResponse get(@PathVariable UUID id) {
    return folioService.get(id);
  }

  @PostMapping("/{id}/items")
  @PreAuthorize("hasAuthority('folio.UPDATE') or hasAuthority('rbac.ADMIN')")
  public FolioItemResponse addItem(@PathVariable UUID id, @Valid @RequestBody FolioItemCreateRequest request) {
    return folioService.addItem(id, request);
  }

  @PostMapping("/{id}/payments")
  @PreAuthorize("hasAuthority('payment.CAPTURE') or hasAuthority('rbac.ADMIN')")
  public PaymentResponse addPayment(@PathVariable UUID id, @Valid @RequestBody PaymentCreateRequest request) {
    return folioService.addPayment(id, request);
  }

  @PostMapping("/{id}/close")
  @PreAuthorize("hasAuthority('folio.CLOSE') or hasAuthority('rbac.ADMIN')")
  public FolioDetailResponse close(@PathVariable UUID id) {
    return folioService.close(id);
  }
}
