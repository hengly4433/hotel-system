package com.blockcode.hotel.reservation.api;

import com.blockcode.hotel.reservation.api.dto.AvailabilityResponse;
import com.blockcode.hotel.reservation.api.dto.RoomTypeAvailabilityResponse;
import com.blockcode.hotel.reservation.application.AvailabilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/availability")
public class AvailabilityController {
  private final AvailabilityService availabilityService;

  public AvailabilityController(AvailabilityService availabilityService) {
    this.availabilityService = availabilityService;
  }

  @GetMapping("/rooms")
  @PreAuthorize("hasAuthority('reservation.READ')")
  public AvailabilityResponse roomAvailability(
      @RequestParam UUID roomId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
  ) {
    boolean available = availabilityService.isRoomAvailable(roomId, from, to);
    return new AvailabilityResponse(available);
  }

  @GetMapping("/room-types")
  @PreAuthorize("hasAuthority('room.READ') or hasAuthority('reservation.READ') or hasAuthority('rbac.ADMIN')")
  public List<RoomTypeAvailabilityResponse> roomTypeAvailability(
      @RequestParam UUID propertyId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
  ) {
    return availabilityService.getRoomTypeAvailability(propertyId, from, to);
  }
}
