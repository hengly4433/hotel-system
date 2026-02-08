package com.blockcode.hotel.room.api.dto;

import java.util.UUID;

public record RoomResponse(
        UUID id,
        UUID propertyId,
        UUID roomTypeId,
        String roomNumber,
        String floor,
        String housekeepingZone,
        boolean isActive,
        String profileImage,
        java.util.List<RoomImageResponse> galleryImages) {
}
