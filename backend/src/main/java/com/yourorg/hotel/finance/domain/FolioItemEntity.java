package com.yourorg.hotel.finance.domain;

import com.yourorg.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "folio_items")
public class FolioItemEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "folio_id", nullable = false)
  private UUID folioId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "type", nullable = false)
  private FolioItemType type;

  @Column(name = "description", nullable = false)
  private String description;

  @Column(name = "qty", nullable = false, precision = 12, scale = 4)
  private BigDecimal qty = BigDecimal.ONE;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPrice = BigDecimal.ZERO;

  @Column(name = "amount", nullable = false, precision = 12, scale = 2)
  private BigDecimal amount = BigDecimal.ZERO;

  @Column(name = "posted_at", nullable = false)
  private Instant postedAt = Instant.now();

  @Column(name = "posted_by")
  private UUID postedBy;

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

  public FolioItemType getType() {
    return type;
  }

  public void setType(FolioItemType type) {
    this.type = type;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public BigDecimal getQty() {
    return qty;
  }

  public void setQty(BigDecimal qty) {
    this.qty = qty;
  }

  public BigDecimal getUnitPrice() {
    return unitPrice;
  }

  public void setUnitPrice(BigDecimal unitPrice) {
    this.unitPrice = unitPrice;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public Instant getPostedAt() {
    return postedAt;
  }

  public void setPostedAt(Instant postedAt) {
    this.postedAt = postedAt;
  }

  public UUID getPostedBy() {
    return postedBy;
  }

  public void setPostedBy(UUID postedBy) {
    this.postedBy = postedBy;
  }
}
