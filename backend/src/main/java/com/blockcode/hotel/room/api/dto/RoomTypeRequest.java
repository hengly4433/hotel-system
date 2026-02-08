package com.blockcode.hotel.room.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record RoomTypeRequest(
    @NotNull UUID propertyId,
    @NotBlank String code,
    @NotBlank String name,
    Integer maxAdults,
    Integer maxChildren,
    Integer maxOccupancy,
    String baseDescription,
    String defaultBedType,
    List<@Valid RoomTypeImageRequest> images
) {
}
