package com.yourorg.hotel.room.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RoomRequest(
    @NotNull UUID propertyId,
    @NotNull UUID roomTypeId,
    @NotBlank String roomNumber,
    String floor,
    String housekeepingZone,
    Boolean isActive
) {
}
