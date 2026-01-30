package com.yourorg.hotel.organization.api.dto;

import java.util.UUID;

public record OrganizationResponse(
    UUID id,
    String name
) {
}
