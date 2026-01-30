package com.yourorg.hotel.reservation.domain;

import com.yourorg.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "reservation_type_nights")
public class ReservationTypeNightEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "reservation_room_id", nullable = false)
  private UUID reservationRoomId;

  @Column(name = "room_type_id", nullable = false)
  private UUID roomTypeId;

  @Column(name = "date", nullable = false)
  private LocalDate date;

  @Column(name = "price", precision = 12, scale = 2, nullable = false)
  private BigDecimal price;

  @Column(name = "currency", nullable = false)
  private String currency;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getReservationRoomId() {
    return reservationRoomId;
  }

  public void setReservationRoomId(UUID reservationRoomId) {
    this.reservationRoomId = reservationRoomId;
  }

  public UUID getRoomTypeId() {
    return roomTypeId;
  }

  public void setRoomTypeId(UUID roomTypeId) {
    this.roomTypeId = roomTypeId;
  }

  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal price) {
    this.price = price;
  }

  public String getCurrency() {
    return currency;
  }

  public void setCurrency(String currency) {
    this.currency = currency;
  }
}
