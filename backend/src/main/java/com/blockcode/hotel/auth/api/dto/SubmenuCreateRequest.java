package com.blockcode.hotel.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubmenuCreateRequest(
    @NotNull UUID menuId,
    @NotBlank String key,
    @NotBlank String label,
    @NotBlank String route,
    Integer sortOrder
) {
}
