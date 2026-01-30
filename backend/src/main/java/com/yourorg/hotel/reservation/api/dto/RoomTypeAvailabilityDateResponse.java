package com.yourorg.hotel.reservation.api.dto;

import java.time.LocalDate;

public record RoomTypeAvailabilityDateResponse(
    LocalDate date,
    int reserved,
    int available
) {
}
