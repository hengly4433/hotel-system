package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record RoleUpdateRequest(
    @NotBlank String name,
    UUID propertyId
) {
}
