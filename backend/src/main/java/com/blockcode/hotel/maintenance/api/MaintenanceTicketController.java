package com.blockcode.hotel.maintenance.api;

import com.blockcode.hotel.maintenance.api.dto.MaintenanceTicketEventResponse;
import com.blockcode.hotel.maintenance.api.dto.MaintenanceTicketRequest;
import com.blockcode.hotel.maintenance.api.dto.MaintenanceTicketResponse;
import com.blockcode.hotel.maintenance.application.MaintenanceTicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/maintenance")
@Validated
public class MaintenanceTicketController {
  private final MaintenanceTicketService ticketService;

  public MaintenanceTicketController(MaintenanceTicketService ticketService) {
    this.ticketService = ticketService;
  }

  @PostMapping("/tickets")
  @PreAuthorize("hasAuthority('maintenance.CREATE') or hasAuthority('rbac.ADMIN')")
  public MaintenanceTicketResponse create(@Valid @RequestBody MaintenanceTicketRequest request) {
    return ticketService.create(request);
  }

  @GetMapping("/tickets")
  @PreAuthorize("hasAuthority('maintenance.READ') or hasAuthority('rbac.ADMIN')")
  public List<MaintenanceTicketResponse> list(@RequestParam(required = false) UUID propertyId) {
    return ticketService.list(propertyId);
  }

  @GetMapping("/tickets/{id}")
  @PreAuthorize("hasAuthority('maintenance.READ') or hasAuthority('rbac.ADMIN')")
  public MaintenanceTicketResponse get(@PathVariable UUID id) {
    return ticketService.get(id);
  }

  @GetMapping("/tickets/{id}/events")
  @PreAuthorize("hasAuthority('maintenance.READ') or hasAuthority('rbac.ADMIN')")
  public List<MaintenanceTicketEventResponse> events(@PathVariable UUID id) {
    return ticketService.events(id);
  }

  @PutMapping("/tickets/{id}")
  @PreAuthorize("hasAuthority('maintenance.UPDATE') or hasAuthority('rbac.ADMIN')")
  public MaintenanceTicketResponse update(@PathVariable UUID id, @Valid @RequestBody MaintenanceTicketRequest request) {
    return ticketService.update(id, request);
  }

  @PostMapping("/tickets/{id}/start")
  @PreAuthorize("hasAuthority('maintenance.UPDATE') or hasAuthority('rbac.ADMIN')")
  public MaintenanceTicketResponse start(@PathVariable UUID id) {
    return ticketService.start(id);
  }

  @PostMapping("/tickets/{id}/resolve")
  @PreAuthorize("hasAuthority('maintenance.UPDATE') or hasAuthority('rbac.ADMIN')")
  public MaintenanceTicketResponse resolve(@PathVariable UUID id) {
    return ticketService.resolve(id);
  }

  @PostMapping("/tickets/{id}/close")
  @PreAuthorize("hasAuthority('maintenance.UPDATE') or hasAuthority('rbac.ADMIN')")
  public MaintenanceTicketResponse close(@PathVariable UUID id) {
    return ticketService.close(id);
  }

  @DeleteMapping("/tickets/{id}")
  @PreAuthorize("hasAuthority('maintenance.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    ticketService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
