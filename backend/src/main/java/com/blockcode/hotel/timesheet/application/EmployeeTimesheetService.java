package com.blockcode.hotel.timesheet.application;

import com.blockcode.hotel.audit.application.AuditService;
import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.employee.infra.EmployeeRepository;
import com.blockcode.hotel.timesheet.api.dto.EmployeeTimesheetRequest;
import com.blockcode.hotel.timesheet.api.dto.EmployeeTimesheetResponse;
import com.blockcode.hotel.timesheet.domain.EmployeeTimesheetEntity;
import com.blockcode.hotel.timesheet.domain.TimesheetStatus;
import com.blockcode.hotel.timesheet.infra.EmployeeTimesheetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EmployeeTimesheetService {
  private final EmployeeTimesheetRepository timesheetRepository;
  private final EmployeeRepository employeeRepository;
  private final AuditService auditService;

  public EmployeeTimesheetService(
      EmployeeTimesheetRepository timesheetRepository,
      EmployeeRepository employeeRepository,
      AuditService auditService
  ) {
    this.timesheetRepository = timesheetRepository;
    this.employeeRepository = employeeRepository;
    this.auditService = auditService;
  }

  public EmployeeTimesheetResponse create(EmployeeTimesheetRequest request) {
    validateEmployee(request.employeeId());
    var shift = request.shift() == null ? com.blockcode.hotel.housekeeping.domain.WorkShift.AM : request.shift();
    if (timesheetRepository.existsByEmployeeIdAndWorkDateAndShiftAndDeletedAtIsNull(
        request.employeeId(), request.workDate(), shift)) {
      throw new AppException("TIMESHEET_EXISTS", "Timesheet already exists for this shift", HttpStatus.CONFLICT);
    }
    EmployeeTimesheetEntity entity = new EmployeeTimesheetEntity();
    apply(entity, request);
    timesheetRepository.save(entity);
    auditService.log("timesheet", entity.getId(), "CREATE", null, entity, entity.getPropertyId());
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<EmployeeTimesheetResponse> list(UUID propertyId) {
    if (propertyId == null) {
      throw new AppException("PROPERTY_REQUIRED", "Property ID is required", HttpStatus.BAD_REQUEST);
    }
    return timesheetRepository.findAllByPropertyIdAndDeletedAtIsNullOrderByWorkDateDesc(propertyId)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public EmployeeTimesheetResponse get(UUID id) {
    EmployeeTimesheetEntity entity = timesheetRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Timesheet not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public EmployeeTimesheetResponse update(UUID id, EmployeeTimesheetRequest request) {
    EmployeeTimesheetEntity entity = timesheetRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Timesheet not found", HttpStatus.NOT_FOUND));
    Object before = entitySnapshot(entity);
    validateEmployee(request.employeeId());
    apply(entity, request);
    timesheetRepository.save(entity);
    auditService.log("timesheet", entity.getId(), "UPDATE", before, entity, entity.getPropertyId());
    return toResponse(entity);
  }

  public void softDelete(UUID id) {
    EmployeeTimesheetEntity entity = timesheetRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Timesheet not found", HttpStatus.NOT_FOUND));
    Object before = entitySnapshot(entity);
    entity.setDeletedAt(Instant.now());
    timesheetRepository.save(entity);
    auditService.log("timesheet", entity.getId(), "DELETE", before, entity, entity.getPropertyId());
  }

  private void validateEmployee(UUID employeeId) {
    if (employeeId == null || employeeRepository.findByIdAndDeletedAtIsNull(employeeId).isEmpty()) {
      throw new AppException("EMPLOYEE_NOT_FOUND", "Employee not found", HttpStatus.BAD_REQUEST);
    }
  }

  private void apply(EmployeeTimesheetEntity entity, EmployeeTimesheetRequest request) {
    entity.setPropertyId(request.propertyId());
    entity.setEmployeeId(request.employeeId());
    entity.setWorkDate(request.workDate());
    entity.setShift(request.shift() == null ? entity.getShift() : request.shift());
    entity.setClockIn(request.clockIn());
    entity.setClockOut(request.clockOut());
    entity.setBreakMinutes(request.breakMinutes() == null ? entity.getBreakMinutes() : request.breakMinutes());
    entity.setStatus(request.status() == null ? entity.getStatus() : request.status());
    entity.setNotes(request.notes());

    int totalMinutes = calculateMinutes(entity.getClockIn(), entity.getClockOut(), entity.getBreakMinutes());
    entity.setTotalMinutes(totalMinutes);
  }

  private int calculateMinutes(Instant clockIn, Instant clockOut, int breakMinutes) {
    if (clockIn == null || clockOut == null) {
      return 0;
    }
    if (clockOut.isBefore(clockIn)) {
      throw new AppException("INVALID_TIME", "Clock-out must be after clock-in", HttpStatus.BAD_REQUEST);
    }
    long minutes = Duration.between(clockIn, clockOut).toMinutes() - Math.max(breakMinutes, 0);
    return (int) Math.max(minutes, 0);
  }

  private EmployeeTimesheetResponse toResponse(EmployeeTimesheetEntity entity) {
    return new EmployeeTimesheetResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getEmployeeId(),
        entity.getWorkDate(),
        entity.getShift(),
        entity.getClockIn(),
        entity.getClockOut(),
        entity.getBreakMinutes(),
        entity.getTotalMinutes(),
        entity.getStatus(),
        entity.getNotes()
    );
  }

  private EmployeeTimesheetEntity entitySnapshot(EmployeeTimesheetEntity entity) {
    EmployeeTimesheetEntity snapshot = new EmployeeTimesheetEntity();
    snapshot.setId(entity.getId());
    snapshot.setPropertyId(entity.getPropertyId());
    snapshot.setEmployeeId(entity.getEmployeeId());
    snapshot.setWorkDate(entity.getWorkDate());
    snapshot.setShift(entity.getShift());
    snapshot.setClockIn(entity.getClockIn());
    snapshot.setClockOut(entity.getClockOut());
    snapshot.setBreakMinutes(entity.getBreakMinutes());
    snapshot.setTotalMinutes(entity.getTotalMinutes());
    snapshot.setStatus(entity.getStatus());
    snapshot.setNotes(entity.getNotes());
    return snapshot;
  }
}
