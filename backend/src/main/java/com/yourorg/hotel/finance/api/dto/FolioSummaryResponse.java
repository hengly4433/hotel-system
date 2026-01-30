package com.yourorg.hotel.finance.api.dto;

import com.yourorg.hotel.finance.domain.FolioStatus;

import java.util.UUID;

public record FolioSummaryResponse(
    UUID id,
    UUID reservationId,
    FolioStatus status,
    String currency
) {
}
