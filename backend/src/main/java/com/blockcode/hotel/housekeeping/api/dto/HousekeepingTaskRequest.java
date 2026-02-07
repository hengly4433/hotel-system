package com.blockcode.hotel.housekeeping.api.dto;

import com.blockcode.hotel.housekeeping.domain.HousekeepingStatus;
import com.blockcode.hotel.housekeeping.domain.WorkShift;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HousekeepingTaskRequest(
    @NotNull UUID propertyId,
    @NotNull UUID roomId,
    @NotNull LocalDate taskDate,
    WorkShift shift,
    HousekeepingStatus status,
    UUID assignedToEmployeeId,
    String checklist,
    Instant dueAt
) {
}
