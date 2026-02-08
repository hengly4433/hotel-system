package com.blockcode.hotel.auth.api.dto;

import com.blockcode.hotel.auth.domain.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public record UserCreateRequest(
    @NotBlank @Email String email,
    @NotBlank String password,
    UserStatus status,
    UUID propertyId,
    List<UUID> roleIds
) {
}
