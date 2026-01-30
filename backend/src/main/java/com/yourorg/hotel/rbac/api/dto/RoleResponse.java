package com.yourorg.hotel.rbac.api.dto;

import java.util.UUID;

public record RoleResponse(
    UUID id,
    String name,
    UUID propertyId
) {
}
