package com.yourorg.hotel.rbac.api.dto;

import java.util.List;

public record PermissionGroupResponse(
    String resource,
    List<PermissionResponse> permissions
) {
}
