package com.blockcode.hotel.auth.api.dto;

import java.util.UUID;

public record SubmenuResponse(
    UUID id,
    UUID menuId,
    String key,
    String label,
    String route,
    Integer sortOrder
) {
}
