package com.yourorg.hotel.timesheet.api.dto;

import com.yourorg.hotel.housekeeping.domain.WorkShift;
import com.yourorg.hotel.timesheet.domain.TimesheetStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeTimesheetRequest(
    @NotNull UUID propertyId,
    @NotNull UUID employeeId,
    @NotNull LocalDate workDate,
    WorkShift shift,
    Instant clockIn,
    Instant clockOut,
    Integer breakMinutes,
    TimesheetStatus status,
    String notes
) {
}
