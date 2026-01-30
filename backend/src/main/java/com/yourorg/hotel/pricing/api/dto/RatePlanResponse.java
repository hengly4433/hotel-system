package com.yourorg.hotel.pricing.api.dto;

import java.util.UUID;

public record RatePlanResponse(
    UUID id,
    UUID propertyId,
    String code,
    String name,
    boolean refundable,
    boolean includesBreakfast,
    UUID cancellationPolicyId
) {
}
