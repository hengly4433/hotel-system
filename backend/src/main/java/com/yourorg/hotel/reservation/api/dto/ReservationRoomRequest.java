package com.yourorg.hotel.reservation.api.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ReservationRoomRequest(
    @NotNull UUID roomTypeId,
    UUID roomId,
    @NotNull UUID ratePlanId,
    Integer guestsInRoom,
    List<NightlyRateRequest> nightlyRates
) {
}
