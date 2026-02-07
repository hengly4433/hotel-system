package com.blockcode.hotel.pricing.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RatePlanRequest(
    @NotNull UUID propertyId,
    @NotBlank String code,
    @NotBlank String name,
    Boolean refundable,
    Boolean includesBreakfast,
    UUID cancellationPolicyId
) {
}
