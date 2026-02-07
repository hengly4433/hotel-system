package com.blockcode.hotel.guest.api;

import com.blockcode.hotel.guest.api.dto.GuestRequest;
import com.blockcode.hotel.guest.api.dto.GuestResponse;
import com.blockcode.hotel.guest.application.GuestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/guests")
@Validated
public class GuestController {
  private final GuestService guestService;

  public GuestController(GuestService guestService) {
    this.guestService = guestService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('guest.CREATE') or hasAuthority('rbac.ADMIN')")
  public GuestResponse create(@Valid @RequestBody GuestRequest request) {
    return guestService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('guest.READ') or hasAuthority('rbac.ADMIN')")
  public List<GuestResponse> list() {
    return guestService.list();
  }

  @GetMapping("/search")
  @PreAuthorize("hasAuthority('guest.READ') or hasAuthority('rbac.ADMIN')")
  public List<GuestResponse> search(@RequestParam String q) {
    return guestService.search(q);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('guest.READ') or hasAuthority('rbac.ADMIN')")
  public GuestResponse get(@PathVariable UUID id) {
    return guestService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('guest.UPDATE') or hasAuthority('rbac.ADMIN')")
  public GuestResponse update(@PathVariable UUID id, @Valid @RequestBody GuestRequest request) {
    return guestService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('guest.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    guestService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
