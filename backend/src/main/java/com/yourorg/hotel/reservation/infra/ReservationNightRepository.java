package com.yourorg.hotel.reservation.infra;

import com.yourorg.hotel.reservation.domain.ReservationNightEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ReservationNightRepository extends JpaRepository<ReservationNightEntity, UUID> {
  List<ReservationNightEntity> findByReservationRoomId(UUID reservationRoomId);

  long countByRoomIdAndDateInAndDeletedAtIsNull(UUID roomId, Collection<LocalDate> dates);

  @Query(
      "select case when count(n) > 0 then true else false end " +
      "from ReservationNightEntity n " +
      "where n.roomId = :roomId and n.deletedAt is null " +
      "and n.date >= :fromDate and n.date < :toDate"
  )
  boolean existsConflict(@Param("roomId") UUID roomId,
                         @Param("fromDate") LocalDate fromDate,
                         @Param("toDate") LocalDate toDate);

  @Query(
      value = "select rn.room_id, rn.date " +
          "from reservation_nights rn " +
          "join rooms r on r.id = rn.room_id " +
          "where r.property_id = :propertyId " +
          "and rn.deleted_at is null " +
          "and rn.date >= :fromDate and rn.date < :toDate",
      nativeQuery = true
  )
  List<Object[]> findRoomBoardDates(@Param("propertyId") UUID propertyId,
                                    @Param("fromDate") LocalDate fromDate,
                                    @Param("toDate") LocalDate toDate);

  @Query(
      value = "select r.room_type_id, rn.date, count(rn.id) " +
          "from reservation_nights rn " +
          "join rooms r on r.id = rn.room_id " +
          "where r.property_id = :propertyId " +
          "and rn.deleted_at is null " +
          "and rn.date >= :fromDate and rn.date < :toDate " +
          "group by r.room_type_id, rn.date",
      nativeQuery = true
  )
  List<Object[]> countByRoomTypeAndDate(@Param("propertyId") UUID propertyId,
                                        @Param("fromDate") LocalDate fromDate,
                                        @Param("toDate") LocalDate toDate);

  @Query(
      value = "select count(rn.id) " +
          "from reservation_nights rn " +
          "join rooms r on r.id = rn.room_id " +
          "where rn.deleted_at is null " +
          "and r.room_type_id = :roomTypeId " +
          "and rn.date = :date",
      nativeQuery = true
  )
  long countAssignedByRoomTypeAndDate(@Param("roomTypeId") UUID roomTypeId,
                                      @Param("date") LocalDate date);

  @Modifying
  @Query("update ReservationNightEntity n set n.deletedAt = :deletedAt " +
      "where n.reservationRoomId in :reservationRoomIds and n.deletedAt is null")
  int softDeleteByReservationRoomIds(@Param("reservationRoomIds") Collection<UUID> reservationRoomIds,
                                     @Param("deletedAt") Instant deletedAt);
}
