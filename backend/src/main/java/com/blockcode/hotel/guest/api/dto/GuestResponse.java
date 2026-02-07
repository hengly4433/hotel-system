package com.blockcode.hotel.guest.api.dto;

import com.blockcode.hotel.guest.domain.LoyaltyTier;

import java.time.LocalDate;
import java.util.UUID;

public record GuestResponse(
    UUID id,
    UUID personId,
    String firstName,
    String lastName,
    LocalDate dob,
    String phone,
    String email,
    String addressLine1,
    String addressLine2,
    String city,
    String state,
    String postalCode,
    String country,
    LoyaltyTier loyaltyTier,
    String notes
) {
}
