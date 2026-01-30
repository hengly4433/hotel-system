package com.yourorg.hotel.housekeeping.domain;

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
@Table(name = "housekeeping_task_events")
public class HousekeepingTaskEventEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "task_id", nullable = false)
  private UUID taskId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "status", nullable = false)
  private HousekeepingStatus status;

  @Column(name = "changed_by_user_id")
  private UUID changedByUserId;

  @Column(name = "changed_at", nullable = false)
  private Instant changedAt = Instant.now();

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getTaskId() {
    return taskId;
  }

  public void setTaskId(UUID taskId) {
    this.taskId = taskId;
  }

  public HousekeepingStatus getStatus() {
    return status;
  }

  public void setStatus(HousekeepingStatus status) {
    this.status = status;
  }

  public UUID getChangedByUserId() {
    return changedByUserId;
  }

  public void setChangedByUserId(UUID changedByUserId) {
    this.changedByUserId = changedByUserId;
  }

  public Instant getChangedAt() {
    return changedAt;
  }

  public void setChangedAt(Instant changedAt) {
    this.changedAt = changedAt;
  }
}
