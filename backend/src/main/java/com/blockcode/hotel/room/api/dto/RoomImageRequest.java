package com.blockcode.hotel.room.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RoomImageRequest(
        @NotBlank String url,
        @NotNull Integer sortOrder) {
}
