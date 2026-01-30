package com.yourorg.hotel.customer.application;

public record GoogleIdentityPayload(
    String subject,
    String email,
    boolean emailVerified,
    String givenName,
    String familyName,
    String fullName,
    String pictureUrl
) {
}
