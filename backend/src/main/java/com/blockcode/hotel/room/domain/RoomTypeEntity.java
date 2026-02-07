package com.blockcode.hotel.room.domain;

import com.blockcode.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "room_types")
public class RoomTypeEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "property_id", nullable = false)
  private UUID propertyId;

  @Column(name = "code", nullable = false)
  private String code;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "max_adults", nullable = false)
  private int maxAdults = 1;

  @Column(name = "max_children", nullable = false)
  private int maxChildren = 0;

  @Column(name = "max_occupancy", nullable = false)
  private int maxOccupancy = 1;

  @Column(name = "base_description")
  private String baseDescription;

  @Column(name = "default_bed_type")
  private String defaultBedType;

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

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int getMaxAdults() {
    return maxAdults;
  }

  public void setMaxAdults(int maxAdults) {
    this.maxAdults = maxAdults;
  }

  public int getMaxChildren() {
    return maxChildren;
  }

  public void setMaxChildren(int maxChildren) {
    this.maxChildren = maxChildren;
  }

  public int getMaxOccupancy() {
    return maxOccupancy;
  }

  public void setMaxOccupancy(int maxOccupancy) {
    this.maxOccupancy = maxOccupancy;
  }

  public String getBaseDescription() {
    return baseDescription;
  }

  public void setBaseDescription(String baseDescription) {
    this.baseDescription = baseDescription;
  }

  public String getDefaultBedType() {
    return defaultBedType;
  }

  public void setDefaultBedType(String defaultBedType) {
    this.defaultBedType = defaultBedType;
  }
}
