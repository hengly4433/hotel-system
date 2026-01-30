package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.NotBlank;

public record UserPasswordRequest(@NotBlank String password) {
}
