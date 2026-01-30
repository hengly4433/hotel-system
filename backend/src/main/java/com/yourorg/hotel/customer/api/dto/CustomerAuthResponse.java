package com.yourorg.hotel.customer.api.dto;

public record CustomerAuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    CustomerProfileResponse customer
) {
}
