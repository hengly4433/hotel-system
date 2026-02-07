package com.blockcode.hotel.maintenance.domain;

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
@Table(name = "maintenance_ticket_events")
public class MaintenanceTicketEventEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "ticket_id", nullable = false)
  private UUID ticketId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "status", nullable = false)
  private MaintenanceStatus status;

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

  public UUID getTicketId() {
    return ticketId;
  }

  public void setTicketId(UUID ticketId) {
    this.ticketId = ticketId;
  }

  public MaintenanceStatus getStatus() {
    return status;
  }

  public void setStatus(MaintenanceStatus status) {
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
