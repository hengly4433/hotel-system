package com.blockcode.hotel.housekeeping.api.dto;

import com.blockcode.hotel.housekeeping.domain.HousekeepingStatus;
import com.blockcode.hotel.housekeeping.domain.WorkShift;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HousekeepingTaskResponse(
    UUID id,
    UUID propertyId,
    UUID roomId,
    LocalDate taskDate,
    WorkShift shift,
    HousekeepingStatus status,
    UUID assignedToEmployeeId,
    String checklist,
    Instant dueAt
) {
}
