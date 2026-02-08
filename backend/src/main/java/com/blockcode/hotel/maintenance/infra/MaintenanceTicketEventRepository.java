package com.blockcode.hotel.maintenance.infra;

import com.blockcode.hotel.maintenance.domain.MaintenanceTicketEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MaintenanceTicketEventRepository extends JpaRepository<MaintenanceTicketEventEntity, UUID> {
  List<MaintenanceTicketEventEntity> findAllByTicketIdOrderByChangedAtDesc(UUID ticketId);
}
