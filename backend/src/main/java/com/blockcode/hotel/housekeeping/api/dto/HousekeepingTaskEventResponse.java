package com.blockcode.hotel.housekeeping.api.dto;

import com.blockcode.hotel.housekeeping.domain.HousekeepingStatus;

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
