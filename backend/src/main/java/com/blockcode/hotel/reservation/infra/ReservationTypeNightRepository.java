package com.blockcode.hotel.reservation.infra;

import com.blockcode.hotel.reservation.domain.ReservationTypeNightEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ReservationTypeNightRepository extends JpaRepository<ReservationTypeNightEntity, UUID> {
    List<ReservationTypeNightEntity> findByReservationRoomId(UUID reservationRoomId);

    long countByRoomTypeIdAndDateInAndDeletedAtIsNull(UUID roomTypeId, Collection<LocalDate> dates);

    long countByRoomTypeIdAndDateAndDeletedAtIsNull(UUID roomTypeId, LocalDate date);

    @Query(value = "select rtn.room_type_id, rtn.date, count(rtn.id) " +
            "from reservation_type_nights rtn " +
            "where rtn.deleted_at is null " +
            "and rtn.room_type_id in (:roomTypeIds) " +
            "and rtn.date >= :fromDate and rtn.date < :toDate " +
            "group by rtn.room_type_id, rtn.date", nativeQuery = true)
    List<Object[]> countByRoomTypeIdsAndDateRange(@Param("roomTypeIds") Collection<UUID> roomTypeIds,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    @Modifying
    @Query("update ReservationTypeNightEntity n set n.deletedAt = :deletedAt " +
            "where n.reservationRoomId in :reservationRoomIds and n.deletedAt is null")
    int softDeleteByReservationRoomIds(@Param("reservationRoomIds") Collection<UUID> reservationRoomIds,
            @Param("deletedAt") Instant deletedAt);
}
