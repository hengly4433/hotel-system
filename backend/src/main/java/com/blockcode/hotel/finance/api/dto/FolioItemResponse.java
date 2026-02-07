package com.blockcode.hotel.finance.api.dto;

import com.blockcode.hotel.finance.domain.FolioItemType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FolioItemResponse(
    UUID id,
    UUID folioId,
    FolioItemType type,
    String description,
    BigDecimal qty,
    BigDecimal unitPrice,
    BigDecimal amount,
    Instant postedAt,
    UUID postedBy
) {
}
