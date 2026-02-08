package com.blockcode.hotel.auth.api.dto;

import java.util.UUID;

public record MenuResponse(
    UUID id,
    String key,
    String label,
    Integer sortOrder
) {
}
