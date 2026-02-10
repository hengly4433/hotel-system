package com.blockcode.hotel.auth.api.dto;

import com.blockcode.hotel.auth.domain.UserStatus;
import jakarta.validation.constraints.Email;

import java.util.UUID;

public record UserUpdateRequest(
    @Email String email,
    String firstName,
    String lastName,
    String profileImage,
    UserStatus status,
    UUID propertyId
) {
}
