package com.blockcode.hotel.blog.api.dto;

public record BlogRequest(
        String title,
        String slug,
        String tag,
        String description,
        String imageUrl,
        String content,
        boolean isActive) {
}
