package com.blockcode.hotel.customer.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerRegisterRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @Email @NotBlank String email,
    @NotBlank String password,
    String phone
) {
}
