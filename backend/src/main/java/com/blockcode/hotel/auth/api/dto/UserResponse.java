package com.blockcode.hotel.auth.api.dto;

import com.blockcode.hotel.auth.domain.UserStatus;

import java.util.List;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String firstName,
    String lastName,
    String profileImage,
    UserStatus status,
    UUID propertyId,
    List<UUID> roleIds
) {
}
