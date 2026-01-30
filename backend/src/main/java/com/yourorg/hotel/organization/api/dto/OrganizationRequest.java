package com.yourorg.hotel.organization.api.dto;

import jakarta.validation.constraints.NotBlank;

public record OrganizationRequest(
    @NotBlank String name
) {
}
