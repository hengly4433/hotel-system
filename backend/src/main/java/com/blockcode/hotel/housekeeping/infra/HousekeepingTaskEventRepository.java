package com.blockcode.hotel.housekeeping.infra;

import com.blockcode.hotel.housekeeping.domain.HousekeepingTaskEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HousekeepingTaskEventRepository extends JpaRepository<HousekeepingTaskEventEntity, UUID> {
  List<HousekeepingTaskEventEntity> findAllByTaskIdOrderByChangedAtDesc(UUID taskId);
}
