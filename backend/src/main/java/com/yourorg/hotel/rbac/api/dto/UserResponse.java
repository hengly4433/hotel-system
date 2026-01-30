package com.yourorg.hotel.rbac.api.dto;

import com.yourorg.hotel.rbac.domain.UserStatus;

import java.util.List;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    UserStatus status,
    UUID propertyId,
    List<UUID> roleIds
) {
}
