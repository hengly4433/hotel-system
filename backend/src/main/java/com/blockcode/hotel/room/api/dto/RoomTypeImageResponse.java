package com.blockcode.hotel.room.api.dto;

import java.util.UUID;

public record RoomTypeImageResponse(
    UUID id,
    String url,
    int sortOrder,
    boolean isPrimary
) {
}
