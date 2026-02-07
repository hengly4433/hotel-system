package com.blockcode.hotel.reservation.api;

import com.blockcode.hotel.reservation.api.dto.ReservationCreateRequest;
import com.blockcode.hotel.reservation.api.dto.ReservationResponse;
import com.blockcode.hotel.reservation.api.dto.ReservationUpdateRequest;
import com.blockcode.hotel.reservation.application.ReservationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@Validated
public class ReservationController {
  private final ReservationService reservationService;

  public ReservationController(ReservationService reservationService) {
    this.reservationService = reservationService;
  }

  @GetMapping
  @PreAuthorize("hasAuthority('reservation.READ')")
  public List<ReservationResponse> list() {
    return reservationService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('reservation.READ')")
  public ReservationResponse get(@PathVariable UUID id) {
    return reservationService.get(id);
  }

  @PostMapping
  @PreAuthorize("hasAuthority('reservation.CREATE')")
  public ReservationResponse create(@Valid @RequestBody ReservationCreateRequest request) {
    return reservationService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('reservation.UPDATE')")
  public ReservationResponse update(@PathVariable UUID id, @Valid @RequestBody ReservationUpdateRequest request) {
    return reservationService.update(id, request);
  }

  @PostMapping("/{id}/checkin")
  @PreAuthorize("hasAuthority('reservation.CHECKIN')")
  public ReservationResponse checkIn(@PathVariable UUID id) {
    return reservationService.checkIn(id);
  }

  @PostMapping("/{id}/checkout")
  @PreAuthorize("hasAuthority('reservation.CHECKOUT')")
  public ReservationResponse checkOut(@PathVariable UUID id) {
    return reservationService.checkOut(id);
  }

  @PostMapping("/{id}/cancel")
  @PreAuthorize("hasAuthority('reservation.CANCEL')")
  public ReservationResponse cancel(@PathVariable UUID id) {
    return reservationService.cancel(id);
  }
}
