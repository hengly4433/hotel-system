package com.blockcode.hotel.reservation.api.dto;

import jakarta.validation.constraints.PositiveOrZero;

import java.util.UUID;

public record ReservationUpdateRequest(
    UUID primaryGuestId,
    @PositiveOrZero Integer adults,
    @PositiveOrZero Integer children,
    String specialRequests
) {
}
