package com.blockcode.hotel.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PermissionUpdateRequest(
    @NotBlank String resource,
    @NotBlank String action,
    String scope
) {
}
