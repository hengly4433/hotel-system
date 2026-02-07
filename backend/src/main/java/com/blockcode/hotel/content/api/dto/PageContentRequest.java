package com.blockcode.hotel.content.api.dto;

public record PageContentRequest(
        String sectionKey,
        String title,
        String description,
        String imageUrl,
        boolean isActive) {
}
