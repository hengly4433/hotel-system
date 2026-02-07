package com.blockcode.hotel.pricing.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RatePlanPriceResponse(
    UUID id,
    UUID ratePlanId,
    UUID roomTypeId,
    LocalDate date,
    BigDecimal price,
    String currency
) {
}
