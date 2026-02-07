package com.blockcode.hotel.reservation.infra;

import com.blockcode.hotel.reservation.domain.ReservationRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReservationRoomRepository extends JpaRepository<ReservationRoomEntity, UUID> {
  List<ReservationRoomEntity> findByReservationId(UUID reservationId);
}
