package com.blockcode.hotel.pricing.api.dto;

import com.blockcode.hotel.pricing.domain.TaxFeeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.UUID;

public record TaxFeeRequest(
    @NotNull UUID propertyId,
    @NotBlank String name,
    @NotNull TaxFeeType type,
    @NotNull @PositiveOrZero BigDecimal value,
    String appliesTo,
    Boolean active
) {
}
