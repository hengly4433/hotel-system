package com.blockcode.hotel.property.api.dto;

import java.util.UUID;

public record PropertyResponse(
    UUID id,
    UUID organizationId,
    String name,
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
