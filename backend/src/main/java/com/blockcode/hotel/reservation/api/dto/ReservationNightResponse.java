package com.blockcode.hotel.reservation.api.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ReservationNightResponse(
    UUID id,
    UUID roomId,
    LocalDate date,
    double price,
    String currency
) {
}
