package com.blockcode.hotel.pricing.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CancellationPolicyRequest(
    @NotNull UUID propertyId,
    @NotBlank String name,
    @NotBlank String rules
) {
}
