package com.blockcode.hotel.reservation.api.dto;

import com.blockcode.hotel.reservation.domain.ChannelType;
import com.blockcode.hotel.reservation.domain.ReservationStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReservationCreateRequest(
    @NotNull UUID propertyId,
    @NotNull UUID primaryGuestId,
    String code,
    ReservationStatus status,
    ChannelType channel,
    @NotNull LocalDate checkInDate,
    @NotNull LocalDate checkOutDate,
    Integer adults,
    Integer children,
    String specialRequests,
    @Valid @NotEmpty List<ReservationRoomRequest> rooms
) {
}
