package com.yourorg.hotel.reservation.infra;

import com.yourorg.hotel.reservation.domain.ReservationEntity;
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
      com.yourorg.hotel.reservation.domain.ReservationStatus status);

  List<ReservationEntity> findAllByCheckInDateAndDeletedAtIsNull(java.time.LocalDate date);

  List<ReservationEntity> findAllByCheckOutDateAndDeletedAtIsNull(java.time.LocalDate date);
}
