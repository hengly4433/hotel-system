package com.yourorg.hotel.pricing.api.dto;

import com.yourorg.hotel.pricing.domain.TaxFeeType;

import java.math.BigDecimal;
import java.util.UUID;

public record TaxFeeResponse(
    UUID id,
    UUID propertyId,
    String name,
    TaxFeeType type,
    BigDecimal value,
    String appliesTo,
    boolean active
) {
}
