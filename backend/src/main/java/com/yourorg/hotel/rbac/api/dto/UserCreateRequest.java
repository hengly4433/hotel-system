package com.yourorg.hotel.rbac.api.dto;

import com.yourorg.hotel.rbac.domain.UserStatus;
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
