package com.yourorg.hotel.finance.api.dto;

import com.yourorg.hotel.finance.domain.FolioItemType;

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
