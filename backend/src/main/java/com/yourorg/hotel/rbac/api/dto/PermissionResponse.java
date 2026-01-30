package com.yourorg.hotel.rbac.api.dto;

import java.util.UUID;

public record PermissionResponse(
    UUID id,
    String resource,
    String action,
    String scope
) {
}
