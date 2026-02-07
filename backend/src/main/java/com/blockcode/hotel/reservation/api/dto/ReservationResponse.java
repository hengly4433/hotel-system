package com.blockcode.hotel.reservation.api.dto;

import com.blockcode.hotel.reservation.domain.ChannelType;
import com.blockcode.hotel.reservation.domain.ReservationStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReservationResponse(
    UUID id,
    UUID propertyId,
    UUID primaryGuestId,
    String code,
    ReservationStatus status,
    ChannelType channel,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    int adults,
    int children,
    String specialRequests,
    List<ReservationRoomResponse> rooms
) {
}
