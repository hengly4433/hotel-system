package com.blockcode.hotel.timesheet.domain;

import com.blockcode.hotel.common.domain.AuditableEntity;
import com.blockcode.hotel.housekeeping.domain.WorkShift;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "employee_timesheets")
public class EmployeeTimesheetEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "property_id", nullable = false)
  private UUID propertyId;

  @Column(name = "employee_id", nullable = false)
  private UUID employeeId;

  @Column(name = "work_date", nullable = false)
  private LocalDate workDate;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "shift", nullable = false)
  private WorkShift shift = WorkShift.AM;

  @Column(name = "clock_in")
  private Instant clockIn;

  @Column(name = "clock_out")
  private Instant clockOut;

  @Column(name = "break_minutes", nullable = false)
  private int breakMinutes = 0;

  @Column(name = "total_minutes", nullable = false)
  private int totalMinutes = 0;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "status", nullable = false)
  private TimesheetStatus status = TimesheetStatus.OPEN;

  @Column(name = "notes")
  private String notes;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getPropertyId() {
    return propertyId;
  }

  public void setPropertyId(UUID propertyId) {
    this.propertyId = propertyId;
  }

  public UUID getEmployeeId() {
    return employeeId;
  }

  public void setEmployeeId(UUID employeeId) {
    this.employeeId = employeeId;
  }

  public LocalDate getWorkDate() {
    return workDate;
  }

  public void setWorkDate(LocalDate workDate) {
    this.workDate = workDate;
  }

  public WorkShift getShift() {
    return shift;
  }

  public void setShift(WorkShift shift) {
    this.shift = shift;
  }

  public Instant getClockIn() {
    return clockIn;
  }

  public void setClockIn(Instant clockIn) {
    this.clockIn = clockIn;
  }

  public Instant getClockOut() {
    return clockOut;
  }

  public void setClockOut(Instant clockOut) {
    this.clockOut = clockOut;
  }

  public int getBreakMinutes() {
    return breakMinutes;
  }

  public void setBreakMinutes(int breakMinutes) {
    this.breakMinutes = breakMinutes;
  }

  public int getTotalMinutes() {
    return totalMinutes;
  }

  public void setTotalMinutes(int totalMinutes) {
    this.totalMinutes = totalMinutes;
  }

  public TimesheetStatus getStatus() {
    return status;
  }

  public void setStatus(TimesheetStatus status) {
    this.status = status;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
