package com.blockcode.hotel.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record MenuCreateRequest(
    @NotBlank String key,
    @NotBlank String label,
    Integer sortOrder
) {
}
