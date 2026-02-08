package com.blockcode.hotel.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PermissionCreateRequest(
    @NotBlank String resource,
    @NotBlank String action,
    String scope
) {
}
