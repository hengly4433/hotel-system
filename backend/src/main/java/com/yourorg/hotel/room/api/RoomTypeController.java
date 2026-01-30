package com.yourorg.hotel.room.api;

import com.yourorg.hotel.room.api.dto.RoomTypeRequest;
import com.yourorg.hotel.room.api.dto.RoomTypeResponse;
import com.yourorg.hotel.room.application.RoomTypeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/room-types")
public class RoomTypeController {
  private final RoomTypeService roomTypeService;

  public RoomTypeController(RoomTypeService roomTypeService) {
    this.roomTypeService = roomTypeService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('room_type.CREATE') or hasAuthority('rbac.ADMIN')")
  public RoomTypeResponse create(@Valid @RequestBody RoomTypeRequest request) {
    return roomTypeService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('room.READ') or hasAuthority('rbac.ADMIN')")
  public List<RoomTypeResponse> list() {
    return roomTypeService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('room.READ') or hasAuthority('rbac.ADMIN')")
  public RoomTypeResponse get(@PathVariable UUID id) {
    return roomTypeService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('room_type.UPDATE') or hasAuthority('rbac.ADMIN')")
  public RoomTypeResponse update(@PathVariable UUID id, @Valid @RequestBody RoomTypeRequest request) {
    return roomTypeService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('room_type.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    roomTypeService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
