package com.blockcode.hotel.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record MenuUpdateRequest(
    @NotBlank String label,
    Integer sortOrder
) {
}
