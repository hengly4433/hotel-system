package com.blockcode.hotel.finance.api.dto;

import com.blockcode.hotel.finance.domain.PaymentMethod;
import com.blockcode.hotel.finance.domain.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
    UUID id,
    UUID folioId,
    PaymentMethod method,
    BigDecimal amount,
    String currency,
    PaymentStatus status,
    String provider,
    String providerRef,
    String idempotencyKey,
    UUID createdBy,
    Instant createdAt
) {
}
