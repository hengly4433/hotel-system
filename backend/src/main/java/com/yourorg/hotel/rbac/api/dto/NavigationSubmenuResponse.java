package com.yourorg.hotel.rbac.api.dto;

import java.util.UUID;

public record NavigationSubmenuResponse(
    UUID id,
    String key,
    String label,
    String route,
    Integer sortOrder
) {
}
