package com.blockcode.hotel.customer.api.dto;

import java.util.UUID;

public record CustomerProfileResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone
) {
}
