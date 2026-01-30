package com.yourorg.hotel.rbac.api.dto;

import java.util.UUID;

public record MenuTreeSubmenuResponse(
    UUID id,
    String key,
    String label,
    String route,
    Integer sortOrder,
    boolean checked
) {
}
