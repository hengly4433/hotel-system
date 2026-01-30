package com.yourorg.hotel.housekeeping.api.dto;

import com.yourorg.hotel.housekeeping.domain.HousekeepingStatus;
import com.yourorg.hotel.housekeeping.domain.WorkShift;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HousekeepingBoardRowResponse(
    UUID taskId,
    UUID roomId,
    String roomNumber,
    LocalDate taskDate,
    WorkShift shift,
    HousekeepingStatus status,
    UUID assignedToEmployeeId,
    Instant dueAt
) {
}
