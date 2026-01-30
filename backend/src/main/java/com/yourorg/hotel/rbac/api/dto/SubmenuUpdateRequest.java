package com.yourorg.hotel.rbac.api.dto;

import java.util.UUID;

public record SubmenuUpdateRequest(
    UUID menuId,
    String key,
    String label,
    String route,
    Integer sortOrder
) {
}
