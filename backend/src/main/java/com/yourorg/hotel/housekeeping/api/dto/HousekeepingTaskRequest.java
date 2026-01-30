package com.yourorg.hotel.housekeeping.api.dto;

import com.yourorg.hotel.housekeeping.domain.HousekeepingStatus;
import com.yourorg.hotel.housekeeping.domain.WorkShift;
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
