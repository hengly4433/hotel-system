package com.yourorg.hotel.customer.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerLoginRequest(
    @Email @NotBlank String email,
    @NotBlank String password
) {
}
