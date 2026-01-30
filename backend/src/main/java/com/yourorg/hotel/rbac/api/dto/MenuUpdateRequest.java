package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.NotBlank;

public record MenuUpdateRequest(
    @NotBlank String label,
    Integer sortOrder
) {
}
