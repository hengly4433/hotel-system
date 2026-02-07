package com.blockcode.hotel.housekeeping.api.dto;

import com.blockcode.hotel.housekeeping.domain.HousekeepingStatus;
import com.blockcode.hotel.housekeeping.domain.WorkShift;

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
