package com.blockcode.hotel.content.api.dto;

import java.time.Instant;
import java.util.UUID;

public record PageContentResponse(
        UUID id,
        String sectionKey,
        String title,
        String description,
        String imageUrl,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt) {
}
