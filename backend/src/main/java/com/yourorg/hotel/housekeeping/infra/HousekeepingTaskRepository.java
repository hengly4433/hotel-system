package com.yourorg.hotel.housekeeping.infra;

import com.yourorg.hotel.housekeeping.domain.HousekeepingTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;

import com.yourorg.hotel.housekeeping.domain.WorkShift;

public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTaskEntity, UUID> {
  Optional<HousekeepingTaskEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<HousekeepingTaskEntity> findAllByDeletedAtIsNullOrderByTaskDateDesc();

  List<HousekeepingTaskEntity> findAllByPropertyIdAndDeletedAtIsNullOrderByTaskDateDesc(UUID propertyId);

  List<HousekeepingTaskEntity> findAllByPropertyIdAndTaskDateAndDeletedAtIsNullOrderByRoomIdAsc(
      UUID propertyId,
      LocalDate taskDate);

  List<HousekeepingTaskEntity> findAllByPropertyIdAndTaskDateAndShiftAndDeletedAtIsNullOrderByRoomIdAsc(
      UUID propertyId,
      LocalDate taskDate,
      WorkShift shift);

  Optional<HousekeepingTaskEntity> findTopByRoomIdOrderByTaskDateDesc(UUID roomId);
}
