package com.blockcode.hotel.room.infra;

import com.blockcode.hotel.room.domain.RoomImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomImageRepository extends JpaRepository<RoomImageEntity, UUID> {
    List<RoomImageEntity> findAllByRoomIdOrderBySortOrderAsc(UUID roomId);

    void deleteAllByRoomId(UUID roomId);
}
