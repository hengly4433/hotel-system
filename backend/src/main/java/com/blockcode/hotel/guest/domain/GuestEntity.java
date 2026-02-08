package com.blockcode.hotel.guest.domain;

import com.blockcode.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "guests")
public class GuestEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "person_id", nullable = false)
  private UUID personId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "loyalty_tier", nullable = false)
  private LoyaltyTier loyaltyTier = LoyaltyTier.NONE;

  @Column(name = "notes")
  private String notes;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getPersonId() {
    return personId;
  }

  public void setPersonId(UUID personId) {
    this.personId = personId;
  }

  public LoyaltyTier getLoyaltyTier() {
    return loyaltyTier;
  }

  public void setLoyaltyTier(LoyaltyTier loyaltyTier) {
    this.loyaltyTier = loyaltyTier;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
