package com.yourorg.hotel.maintenance.domain;

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
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "maintenance_tickets")
public class MaintenanceTicketEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "property_id", nullable = false)
  private UUID propertyId;

  @Column(name = "room_id", nullable = false)
  private UUID roomId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "priority", nullable = false)
  private MaintenancePriority priority = MaintenancePriority.MEDIUM;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "status", nullable = false)
  private MaintenanceStatus status = MaintenanceStatus.OPEN;

  @Column(name = "description", nullable = false)
  private String description;

  @Column(name = "reported_by_user_id")
  private UUID reportedByUserId;

  @Column(name = "assigned_to_employee_id")
  private UUID assignedToEmployeeId;

  @Column(name = "opened_at", nullable = false)
  private Instant openedAt = Instant.now();

  @Column(name = "closed_at")
  private Instant closedAt;

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

  public MaintenancePriority getPriority() {
    return priority;
  }

  public void setPriority(MaintenancePriority priority) {
    this.priority = priority;
  }

  public MaintenanceStatus getStatus() {
    return status;
  }

  public void setStatus(MaintenanceStatus status) {
    this.status = status;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public UUID getReportedByUserId() {
    return reportedByUserId;
  }

  public void setReportedByUserId(UUID reportedByUserId) {
    this.reportedByUserId = reportedByUserId;
  }

  public UUID getAssignedToEmployeeId() {
    return assignedToEmployeeId;
  }

  public void setAssignedToEmployeeId(UUID assignedToEmployeeId) {
    this.assignedToEmployeeId = assignedToEmployeeId;
  }

  public Instant getOpenedAt() {
    return openedAt;
  }

  public void setOpenedAt(Instant openedAt) {
    this.openedAt = openedAt;
  }

  public Instant getClosedAt() {
    return closedAt;
  }

  public void setClosedAt(Instant closedAt) {
    this.closedAt = closedAt;
  }

  public Instant getDueAt() {
    return dueAt;
  }

  public void setDueAt(Instant dueAt) {
    this.dueAt = dueAt;
  }
}
