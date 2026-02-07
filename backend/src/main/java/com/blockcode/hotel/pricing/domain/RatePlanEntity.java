package com.blockcode.hotel.pricing.domain;

import com.blockcode.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "rate_plans")
public class RatePlanEntity extends AuditableEntity {
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

  @Column(name = "is_refundable", nullable = false)
  private boolean refundable = true;

  @Column(name = "includes_breakfast", nullable = false)
  private boolean includesBreakfast = false;

  @Column(name = "cancellation_policy_id")
  private UUID cancellationPolicyId;

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

  public boolean isRefundable() {
    return refundable;
  }

  public void setRefundable(boolean refundable) {
    this.refundable = refundable;
  }

  public boolean isIncludesBreakfast() {
    return includesBreakfast;
  }

  public void setIncludesBreakfast(boolean includesBreakfast) {
    this.includesBreakfast = includesBreakfast;
  }

  public UUID getCancellationPolicyId() {
    return cancellationPolicyId;
  }

  public void setCancellationPolicyId(UUID cancellationPolicyId) {
    this.cancellationPolicyId = cancellationPolicyId;
  }
}
