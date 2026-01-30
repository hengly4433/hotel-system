package com.yourorg.hotel.room.domain;

import com.yourorg.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "rooms")
public class RoomEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "property_id", nullable = false)
  private UUID propertyId;

  @Column(name = "room_type_id", nullable = false)
  private UUID roomTypeId;

  @Column(name = "room_number", nullable = false)
  private String roomNumber;

  @Column(name = "floor")
  private String floor;

  @Column(name = "housekeeping_zone")
  private String housekeepingZone;

  @Column(name = "is_active", nullable = false)
  private boolean isActive = true;

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

  public UUID getRoomTypeId() {
    return roomTypeId;
  }

  public void setRoomTypeId(UUID roomTypeId) {
    this.roomTypeId = roomTypeId;
  }

  public String getRoomNumber() {
    return roomNumber;
  }

  public void setRoomNumber(String roomNumber) {
    this.roomNumber = roomNumber;
  }

  public String getFloor() {
    return floor;
  }

  public void setFloor(String floor) {
    this.floor = floor;
  }

  public String getHousekeepingZone() {
    return housekeepingZone;
  }

  public void setHousekeepingZone(String housekeepingZone) {
    this.housekeepingZone = housekeepingZone;
  }

  public boolean isActive() {
    return isActive;
  }

  public void setActive(boolean active) {
    isActive = active;
  }
}
