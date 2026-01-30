package com.yourorg.hotel.rbac.api.dto;

import java.util.List;
import java.util.UUID;

public record MenuTreeResponse(
    UUID id,
    String key,
    String label,
    Integer sortOrder,
    List<MenuTreeSubmenuResponse> submenus
) {
}
