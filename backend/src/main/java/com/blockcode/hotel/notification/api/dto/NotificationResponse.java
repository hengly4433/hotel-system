package com.blockcode.hotel.notification.api.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    String type,
    String title,
    String message,
    String link,
    boolean isRead,
    Instant createdAt
) {}
