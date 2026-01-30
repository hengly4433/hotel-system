package com.yourorg.hotel.pricing.api.dto;

import java.util.UUID;

public record CancellationPolicyResponse(
    UUID id,
    UUID propertyId,
    String name,
    String rules
) {
}
