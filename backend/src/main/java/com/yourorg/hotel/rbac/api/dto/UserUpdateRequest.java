package com.yourorg.hotel.rbac.api.dto;

import com.yourorg.hotel.rbac.domain.UserStatus;
import jakarta.validation.constraints.Email;

import java.util.UUID;

public record UserUpdateRequest(
    @Email String email,
    UserStatus status,
    UUID propertyId
) {
}
