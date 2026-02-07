package com.blockcode.hotel.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record UserPasswordRequest(@NotBlank String password) {
}
