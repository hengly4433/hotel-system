package com.yourorg.hotel.room.infra;

import com.yourorg.hotel.room.domain.RoomTypeImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RoomTypeImageRepository extends JpaRepository<RoomTypeImageEntity, UUID> {
  List<RoomTypeImageEntity> findAllByRoomTypeIdAndDeletedAtIsNullOrderBySortOrderAsc(UUID roomTypeId);

  List<RoomTypeImageEntity> findAllByRoomTypeIdInAndDeletedAtIsNullOrderBySortOrderAsc(Collection<UUID> roomTypeIds);
}
