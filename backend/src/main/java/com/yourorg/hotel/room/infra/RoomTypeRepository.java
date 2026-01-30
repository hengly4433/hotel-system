package com.yourorg.hotel.room.infra;

import com.yourorg.hotel.room.domain.RoomTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomTypeRepository extends JpaRepository<RoomTypeEntity, UUID> {
  Optional<RoomTypeEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RoomTypeEntity> findAllByDeletedAtIsNullOrderByNameAsc();

  List<RoomTypeEntity> findAllByPropertyIdAndDeletedAtIsNullOrderByNameAsc(UUID propertyId);

  boolean existsByPropertyIdAndCodeAndDeletedAtIsNull(UUID propertyId, String code);
}
