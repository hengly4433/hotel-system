package com.yourorg.hotel.housekeeping.domain;

import com.yourorg.hotel.common.domain.AuditableEntity;
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
@Table(name = "housekeeping_tasks")
public class HousekeepingTaskEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "property_id", nullable = false)
  private UUID propertyId;

  @Column(name = "room_id", nullable = false)
  private UUID roomId;

  @Column(name = "task_date", nullable = false)
  private LocalDate taskDate;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "shift", nullable = false)
  private WorkShift shift = WorkShift.AM;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "status", nullable = false)
  private HousekeepingStatus status = HousekeepingStatus.PENDING;

  @Column(name = "assigned_to_employee_id")
  private UUID assignedToEmployeeId;

  @Column(name = "checklist", columnDefinition = "jsonb")
  private String checklist;

  @Column(name = "due_at")
  private Instant dueAt;

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

  public UUID getRoomId() {
    return roomId;
  }

  public void setRoomId(UUID roomId) {
    this.roomId = roomId;
  }

  public LocalDate getTaskDate() {
    return taskDate;
  }

  public void setTaskDate(LocalDate taskDate) {
    this.taskDate = taskDate;
  }

  public WorkShift getShift() {
    return shift;
  }

  public void setShift(WorkShift shift) {
    this.shift = shift;
  }

  public HousekeepingStatus getStatus() {
    return status;
  }

  public void setStatus(HousekeepingStatus status) {
    this.status = status;
  }

  public UUID getAssignedToEmployeeId() {
    return assignedToEmployeeId;
  }

  public void setAssignedToEmployeeId(UUID assignedToEmployeeId) {
    this.assignedToEmployeeId = assignedToEmployeeId;
  }

  public String getChecklist() {
    return checklist;
  }

  public void setChecklist(String checklist) {
    this.checklist = checklist;
  }

  public Instant getDueAt() {
    return dueAt;
  }

  public void setDueAt(Instant dueAt) {
    this.dueAt = dueAt;
  }
}
