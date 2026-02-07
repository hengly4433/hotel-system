package com.blockcode.hotel.timesheet.api.dto;

import com.blockcode.hotel.housekeeping.domain.WorkShift;
import com.blockcode.hotel.timesheet.domain.TimesheetStatus;

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
