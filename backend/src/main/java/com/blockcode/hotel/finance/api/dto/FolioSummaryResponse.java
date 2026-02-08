package com.blockcode.hotel.finance.api.dto;

import com.blockcode.hotel.finance.domain.FolioStatus;

import java.util.UUID;

public record FolioSummaryResponse(
    UUID id,
    UUID reservationId,
    FolioStatus status,
    String currency
) {
}
