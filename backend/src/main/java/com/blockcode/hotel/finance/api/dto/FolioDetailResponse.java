package com.blockcode.hotel.finance.api.dto;

import com.blockcode.hotel.finance.domain.FolioStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record FolioDetailResponse(
    UUID id,
    UUID reservationId,
    FolioStatus status,
    String currency,
    List<FolioItemResponse> items,
    List<PaymentResponse> payments,
    BigDecimal totalCharges,
    BigDecimal totalPayments,
    BigDecimal balance
) {
}
