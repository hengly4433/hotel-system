package com.yourorg.hotel.guest.api.dto;

import com.yourorg.hotel.guest.domain.LoyaltyTier;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record GuestRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    LocalDate dob,
    String phone,
    @Email String email,
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
