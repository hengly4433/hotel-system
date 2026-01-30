package com.yourorg.hotel.property.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PropertyRequest(
    @NotNull UUID organizationId,
    @NotBlank String name,
    String timezone,
    String currency,
    String addressLine1,
    String addressLine2,
    String city,
    String state,
    String postalCode,
    String country
) {
}
