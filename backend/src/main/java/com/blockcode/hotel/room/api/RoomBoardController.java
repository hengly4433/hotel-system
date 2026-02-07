package com.blockcode.hotel.room.api;

import com.blockcode.hotel.room.api.dto.RoomBoardRowResponse;
import com.blockcode.hotel.room.application.RoomBoardService;
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
@RequestMapping("/api/v1/inventory")
public class RoomBoardController {
  private final RoomBoardService roomBoardService;

  public RoomBoardController(RoomBoardService roomBoardService) {
    this.roomBoardService = roomBoardService;
  }

  @GetMapping("/rooms")
  @PreAuthorize("hasAuthority('room.READ') or hasAuthority('rbac.ADMIN')")
  public List<RoomBoardRowResponse> roomBoard(
      @RequestParam UUID propertyId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
  ) {
    return roomBoardService.getRoomBoard(propertyId, from, to);
  }
}
