package com.blockcode.hotel.publicapi.api.dto;

import java.util.UUID;

public record PublicPropertyResponse(
    UUID id,
    String name,
    String addressLine1,
    String addressLine2,
    String city,
    String state,
    String postalCode,
    String country
) {
}
