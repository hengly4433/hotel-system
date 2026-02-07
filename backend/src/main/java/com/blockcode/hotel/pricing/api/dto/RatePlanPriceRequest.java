package com.blockcode.hotel.pricing.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RatePlanPriceRequest(
    @NotNull UUID ratePlanId,
    @NotNull UUID roomTypeId,
    @NotNull LocalDate date,
    @NotNull @PositiveOrZero BigDecimal price,
    String currency
) {
}
