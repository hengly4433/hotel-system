package com.blockcode.hotel.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record RoleUpdateRequest(
    @NotBlank String name,
    UUID propertyId
) {
}
