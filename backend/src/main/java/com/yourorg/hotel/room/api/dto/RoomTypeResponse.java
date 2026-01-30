package com.yourorg.hotel.room.api.dto;

import java.util.List;
import java.util.UUID;

public record RoomTypeResponse(
    UUID id,
    UUID propertyId,
    String code,
    String name,
    int maxAdults,
    int maxChildren,
    int maxOccupancy,
    String baseDescription,
    String defaultBedType,
    List<RoomTypeImageResponse> images
) {
}
