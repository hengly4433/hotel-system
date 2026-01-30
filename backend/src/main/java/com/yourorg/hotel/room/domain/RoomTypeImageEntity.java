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
@Table(name = "room_type_images")
public class RoomTypeImageEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "room_type_id", nullable = false)
  private UUID roomTypeId;

  @Column(name = "url", nullable = false)
  private String url;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder = 0;

  @Column(name = "is_primary", nullable = false)
  private boolean isPrimary = false;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getRoomTypeId() {
    return roomTypeId;
  }

  public void setRoomTypeId(UUID roomTypeId) {
    this.roomTypeId = roomTypeId;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public int getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(int sortOrder) {
    this.sortOrder = sortOrder;
  }

  public boolean isPrimary() {
    return isPrimary;
  }

  public void setPrimary(boolean primary) {
    isPrimary = primary;
  }
}
