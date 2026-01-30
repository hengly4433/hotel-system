package com.yourorg.hotel.timesheet.api.dto;

import com.yourorg.hotel.housekeeping.domain.WorkShift;
import com.yourorg.hotel.timesheet.domain.TimesheetStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeTimesheetResponse(
    UUID id,
    UUID propertyId,
    UUID employeeId,
    LocalDate workDate,
    WorkShift shift,
    Instant clockIn,
    Instant clockOut,
    int breakMinutes,
    int totalMinutes,
    TimesheetStatus status,
    String notes
) {
}
