package com.yourorg.hotel.reservation.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.yourorg.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "reservation_rooms")
public class ReservationRoomEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "reservation_id", nullable = false)
  private UUID reservationId;

  @Column(name = "room_type_id", nullable = false)
  private UUID roomTypeId;

  @Column(name = "room_id")
  private UUID roomId;

  @Column(name = "rate_plan_id", nullable = false)
  private UUID ratePlanId;

  @Column(name = "guests_in_room", nullable = false)
  private int guestsInRoom = 1;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "nightly_rate_snapshot", columnDefinition = "jsonb")
  private JsonNode nightlyRateSnapshot;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getReservationId() {
    return reservationId;
  }

  public void setReservationId(UUID reservationId) {
    this.reservationId = reservationId;
  }

  public UUID getRoomTypeId() {
    return roomTypeId;
  }

  public void setRoomTypeId(UUID roomTypeId) {
    this.roomTypeId = roomTypeId;
  }

  public UUID getRoomId() {
    return roomId;
  }

  public void setRoomId(UUID roomId) {
    this.roomId = roomId;
  }

  public UUID getRatePlanId() {
    return ratePlanId;
  }

  public void setRatePlanId(UUID ratePlanId) {
    this.ratePlanId = ratePlanId;
  }

  public int getGuestsInRoom() {
    return guestsInRoom;
  }

  public void setGuestsInRoom(int guestsInRoom) {
    this.guestsInRoom = guestsInRoom;
  }

  public JsonNode getNightlyRateSnapshot() {
    return nightlyRateSnapshot;
  }

  public void setNightlyRateSnapshot(JsonNode nightlyRateSnapshot) {
    this.nightlyRateSnapshot = nightlyRateSnapshot;
  }
}
