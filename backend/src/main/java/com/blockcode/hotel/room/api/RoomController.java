package com.blockcode.hotel.room.api;

import com.blockcode.hotel.room.api.dto.RoomRequest;
import com.blockcode.hotel.room.api.dto.RoomResponse;
import com.blockcode.hotel.room.application.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {
  private final RoomService roomService;

  public RoomController(RoomService roomService) {
    this.roomService = roomService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('room.CREATE') or hasAuthority('rbac.ADMIN')")
  public RoomResponse create(@Valid @RequestBody RoomRequest request) {
    return roomService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('room.READ') or hasAuthority('rbac.ADMIN')")
  public List<RoomResponse> list() {
    return roomService.list();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('room.READ') or hasAuthority('rbac.ADMIN')")
  public RoomResponse get(@PathVariable UUID id) {
    return roomService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('room.UPDATE') or hasAuthority('rbac.ADMIN')")
  public RoomResponse update(@PathVariable UUID id, @Valid @RequestBody RoomRequest request) {
    return roomService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('room.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    roomService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
