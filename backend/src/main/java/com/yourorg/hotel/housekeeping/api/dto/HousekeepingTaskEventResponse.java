package com.yourorg.hotel.housekeeping.api.dto;

import com.yourorg.hotel.housekeeping.domain.HousekeepingStatus;

import java.time.Instant;
import java.util.UUID;

public record HousekeepingTaskEventResponse(
    UUID id,
    UUID taskId,
    HousekeepingStatus status,
    UUID changedByUserId,
    Instant changedAt
) {
}
