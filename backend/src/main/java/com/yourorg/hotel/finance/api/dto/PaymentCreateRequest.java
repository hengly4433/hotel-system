package com.yourorg.hotel.finance.api.dto;

import com.yourorg.hotel.finance.domain.PaymentMethod;
import com.yourorg.hotel.finance.domain.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PaymentCreateRequest(
    @NotNull PaymentMethod method,
    @NotNull @DecimalMin("0.0") BigDecimal amount,
    String currency,
    PaymentStatus status,
    String provider,
    String providerRef,
    String idempotencyKey
) {
}
