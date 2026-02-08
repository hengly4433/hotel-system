package com.blockcode.hotel.finance.domain;

import com.blockcode.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payments")
public class PaymentEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "folio_id", nullable = false)
  private UUID folioId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "method", nullable = false)
  private PaymentMethod method;

  @Column(name = "amount", nullable = false, precision = 12, scale = 2)
  private BigDecimal amount = BigDecimal.ZERO;

  @Column(name = "currency", nullable = false)
  private String currency = "USD";

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "status", nullable = false)
  private PaymentStatus status = PaymentStatus.AUTHORIZED;

  @Column(name = "provider")
  private String provider;

  @Column(name = "provider_ref")
  private String providerRef;

  @Column(name = "idempotency_key", nullable = false)
  private String idempotencyKey;

  @Column(name = "created_by")
  private UUID createdBy;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getFolioId() {
    return folioId;
  }

  public void setFolioId(UUID folioId) {
    this.folioId = folioId;
  }

  public PaymentMethod getMethod() {
    return method;
  }

  public void setMethod(PaymentMethod method) {
    this.method = method;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public String getCurrency() {
    return currency;
  }

  public void setCurrency(String currency) {
    this.currency = currency;
  }

  public PaymentStatus getStatus() {
    return status;
  }

  public void setStatus(PaymentStatus status) {
    this.status = status;
  }

  public String getProvider() {
    return provider;
  }

  public void setProvider(String provider) {
    this.provider = provider;
  }

  public String getProviderRef() {
    return providerRef;
  }

  public void setProviderRef(String providerRef) {
    this.providerRef = providerRef;
  }

  public String getIdempotencyKey() {
    return idempotencyKey;
  }

  public void setIdempotencyKey(String idempotencyKey) {
    this.idempotencyKey = idempotencyKey;
  }

  public UUID getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(UUID createdBy) {
    this.createdBy = createdBy;
  }
}
