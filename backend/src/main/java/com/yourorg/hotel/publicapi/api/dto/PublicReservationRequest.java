package com.yourorg.hotel.publicapi.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record PublicReservationRequest(
    @NotNull UUID propertyId,
    @NotNull UUID roomTypeId,
    @NotNull UUID ratePlanId,
    @NotNull LocalDate checkInDate,
    @NotNull LocalDate checkOutDate,
    Integer adults,
    Integer children,
    String specialRequests,
    @Valid @NotNull PublicGuestRequest guest
) {
}
