package com.blockcode.hotel.reservation.api.dto;

import java.util.List;
import java.util.UUID;

public record ReservationRoomResponse(
    UUID id,
    UUID roomTypeId,
    UUID roomId,
    UUID ratePlanId,
    int guestsInRoom,
    List<ReservationNightResponse> nights
) {
}
