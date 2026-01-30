package com.yourorg.hotel.room.api.dto;

import jakarta.validation.constraints.NotBlank;

public record RoomTypeImageRequest(
    @NotBlank String url,
    Integer sortOrder,
    Boolean isPrimary
) {
}
