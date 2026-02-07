package com.blockcode.hotel.auth.api.dto;

import java.util.List;

public record PermissionGroupResponse(
    String resource,
    List<PermissionResponse> permissions
) {
}
