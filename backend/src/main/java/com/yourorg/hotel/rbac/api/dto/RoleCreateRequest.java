package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record RoleCreateRequest(
    @NotBlank String name,
    UUID propertyId
) {
}
