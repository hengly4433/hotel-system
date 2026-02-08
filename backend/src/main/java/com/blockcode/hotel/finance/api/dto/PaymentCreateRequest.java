package com.blockcode.hotel.finance.api.dto;

import com.blockcode.hotel.finance.domain.PaymentMethod;
import com.blockcode.hotel.finance.domain.PaymentStatus;
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
