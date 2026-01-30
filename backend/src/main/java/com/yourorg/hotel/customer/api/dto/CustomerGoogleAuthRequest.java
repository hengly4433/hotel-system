package com.yourorg.hotel.customer.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerGoogleAuthRequest(
    @NotBlank String idToken
) {
}
