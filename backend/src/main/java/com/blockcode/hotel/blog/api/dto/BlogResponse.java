package com.blockcode.hotel.blog.api.dto;

import java.time.Instant;
import java.util.UUID;

public record BlogResponse(
        UUID id,
        String title,
        String slug,
        String tag,
        String description,
        String imageUrl,
        String content,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt) {
}
