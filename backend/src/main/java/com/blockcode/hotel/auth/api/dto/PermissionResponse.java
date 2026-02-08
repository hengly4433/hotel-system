package com.blockcode.hotel.auth.api.dto;

import java.util.UUID;

public record PermissionResponse(
    UUID id,
    String resource,
    String action,
    String scope
) {
}
