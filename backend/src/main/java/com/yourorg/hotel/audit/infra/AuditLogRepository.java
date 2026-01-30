package com.yourorg.hotel.audit.infra;

import com.yourorg.hotel.audit.domain.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {
  List<AuditLogEntity> findAllByOrderByCreatedAtDesc();

  List<AuditLogEntity> findAllByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
}
