package com.yourorg.hotel.room.api.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record RoomBoardRowResponse(
    UUID roomId,
    String roomNumber,
    List<LocalDate> dates
) {
}
