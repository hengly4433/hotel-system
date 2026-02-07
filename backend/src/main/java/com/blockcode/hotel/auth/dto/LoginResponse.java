package com.blockcode.hotel.auth.dto;

public record LoginResponse(
    String accessToken,
    String tokenType,
    long expiresInSeconds
) {
}
