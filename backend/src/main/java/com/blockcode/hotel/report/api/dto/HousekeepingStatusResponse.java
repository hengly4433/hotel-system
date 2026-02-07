package com.blockcode.hotel.report.api.dto;

import java.util.UUID;

public record HousekeepingStatusResponse(
        UUID roomId,
        String roomNumber,
        String roomType,
        String housekeepingStatus,
        String assignedTo) {
}
