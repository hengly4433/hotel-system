package com.yourorg.hotel.report.api.dto;

import java.time.LocalDate;
import java.util.UUID;

public record GuestInHouseResponse(
        UUID reservationId,
        String guestName,
        String roomNumber,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        String status) {
}
