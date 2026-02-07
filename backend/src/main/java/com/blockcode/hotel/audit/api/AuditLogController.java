package com.blockcode.hotel.audit.api;

import com.blockcode.hotel.audit.api.dto.AuditLogResponse;
import com.blockcode.hotel.audit.application.AuditService;
import com.blockcode.hotel.audit.domain.AuditLogEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {
  private final AuditService auditService;

  public AuditLogController(AuditService auditService) {
    this.auditService = auditService;
  }

  @GetMapping
  @PreAuthorize("hasAuthority('audit.READ') or hasAuthority('rbac.ADMIN')")
  public List<AuditLogResponse> list(@RequestParam(required = false) UUID propertyId) {
    return auditService.list(propertyId).stream()
        .map(this::toResponse)
        .toList();
  }

  private AuditLogResponse toResponse(AuditLogEntity entity) {
    return new AuditLogResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getActorUserId(),
        entity.getEntityType(),
        entity.getEntityId(),
        entity.getAction(),
        entity.getBeforeJson(),
        entity.getAfterJson(),
        entity.getRequestId(),
        entity.getIp(),
        entity.getUserAgent(),
        entity.getCreatedAt()
    );
  }
}
