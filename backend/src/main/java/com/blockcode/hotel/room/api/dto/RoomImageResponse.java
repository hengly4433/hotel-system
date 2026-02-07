package com.blockcode.hotel.room.api.dto;

import java.util.UUID;

public record RoomImageResponse(
        UUID id,
        String url,
        int sortOrder) {
}
