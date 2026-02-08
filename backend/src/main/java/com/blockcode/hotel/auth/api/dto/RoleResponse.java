package com.blockcode.hotel.auth.api.dto;

import java.util.UUID;

public record RoleResponse(
    UUID id,
    String name,
    UUID propertyId
) {
}
