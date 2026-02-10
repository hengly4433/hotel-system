package com.blockcode.hotel.reservation.infra;

import com.blockcode.hotel.reservation.domain.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<ReservationEntity, UUID> {
  Optional<ReservationEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<ReservationEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

  Optional<ReservationEntity> findByCodeAndDeletedAtIsNull(String code);

  List<ReservationEntity> findAllByPrimaryGuestIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID primaryGuestId);

  List<ReservationEntity> findAllByStatusAndDeletedAtIsNull(
      com.blockcode.hotel.reservation.domain.ReservationStatus status);

  List<ReservationEntity> findAllByCheckInDateAndDeletedAtIsNull(java.time.LocalDate date);

  List<ReservationEntity> findAllByCheckOutDateAndDeletedAtIsNull(java.time.LocalDate date);

  @org.springframework.data.jpa.repository.Query("select count(r) from ReservationEntity r " +
      "where r.deletedAt is null " +
      "and r.status in ('CONFIRMED', 'CHECKED_IN') " +
      "and :date >= r.checkInDate and :date < r.checkOutDate")
  long countActiveReservationsByDate(@org.springframework.data.repository.query.Param("date") java.time.LocalDate date);

  @org.springframework.data.jpa.repository.Query("select count(r) from ReservationEntity r " +
      "where r.deletedAt is null " +
      "and :startDate <= r.createdAt and :endDate > r.createdAt")
  long countReservationsCreatedBetween(
      @org.springframework.data.repository.query.Param("startDate") java.time.Instant startDate,
      @org.springframework.data.repository.query.Param("endDate") java.time.Instant endDate);
}
