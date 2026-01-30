package com.yourorg.hotel.reservation.api.dto;

import java.util.List;
import java.util.UUID;

public record RoomTypeAvailabilityResponse(
    UUID roomTypeId,
    String code,
    String name,
    int totalRooms,
    List<RoomTypeAvailabilityDateResponse> dates
) {
}
