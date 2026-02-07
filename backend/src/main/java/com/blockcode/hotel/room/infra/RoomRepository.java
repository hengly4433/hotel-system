package com.blockcode.hotel.room.infra;

import com.blockcode.hotel.room.domain.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<RoomEntity, UUID> {
  Optional<RoomEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RoomEntity> findAllByDeletedAtIsNullOrderByRoomNumberAsc();

  List<RoomEntity> findAllByPropertyIdAndDeletedAtIsNullOrderByRoomNumberAsc(UUID propertyId);

  List<RoomEntity> findAllByIdInAndDeletedAtIsNull(Collection<UUID> ids);

  boolean existsByPropertyIdAndRoomNumberAndDeletedAtIsNull(UUID propertyId, String roomNumber);

  @Query("select r.roomTypeId, count(r) from RoomEntity r " +
      "where r.propertyId = :propertyId and r.deletedAt is null and r.isActive = true " +
      "group by r.roomTypeId")
  List<Object[]> countRoomsByRoomType(@Param("propertyId") UUID propertyId);

  long countByRoomTypeIdAndDeletedAtIsNullAndIsActiveTrue(UUID roomTypeId);

  @Query("select count(r) from RoomEntity r where r.deletedAt is null")
  long countActiveRooms();
}
