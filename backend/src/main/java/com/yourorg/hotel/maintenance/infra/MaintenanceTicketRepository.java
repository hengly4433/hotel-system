package com.yourorg.hotel.maintenance.infra;

import com.yourorg.hotel.maintenance.domain.MaintenanceTicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicketEntity, UUID> {
  Optional<MaintenanceTicketEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<MaintenanceTicketEntity> findAllByDeletedAtIsNullOrderByOpenedAtDesc();

  List<MaintenanceTicketEntity> findAllByPropertyIdAndDeletedAtIsNullOrderByOpenedAtDesc(UUID propertyId);
}
