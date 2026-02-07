package com.blockcode.hotel.reservation.api.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record NightlyRateRequest(
    @NotNull LocalDate date,
    double price,
    String currency
) {
}
