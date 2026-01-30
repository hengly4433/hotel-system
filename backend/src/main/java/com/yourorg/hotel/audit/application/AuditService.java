package com.yourorg.hotel.audit.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourorg.hotel.audit.domain.AuditLogEntity;
import com.yourorg.hotel.audit.infra.AuditLogRepository;
import com.yourorg.hotel.common.security.CurrentUserProvider;
import com.yourorg.hotel.rbac.infra.RbacUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AuditService {
  private final AuditLogRepository auditLogRepository;
  private final CurrentUserProvider currentUserProvider;
  private final ObjectMapper objectMapper;
  private final RbacUserRepository rbacUserRepository;

  public AuditService(
      AuditLogRepository auditLogRepository,
      CurrentUserProvider currentUserProvider,
      ObjectMapper objectMapper,
      RbacUserRepository rbacUserRepository
  ) {
    this.auditLogRepository = auditLogRepository;
    this.currentUserProvider = currentUserProvider;
    this.objectMapper = objectMapper;
    this.rbacUserRepository = rbacUserRepository;
  }

  public void log(String entityType, UUID entityId, String action, Object before, Object after, UUID propertyId) {
    AuditLogEntity log = new AuditLogEntity();
    log.setEntityType(entityType);
    log.setEntityId(entityId);
    log.setAction(action);
    log.setPropertyId(propertyId);
    log.setActorUserId(resolveActorUserId());
    log.setBeforeJson(serialize(before));
    log.setAfterJson(serialize(after));
    log.setCreatedAt(Instant.now());

    RequestMeta meta = getRequestMeta();
    log.setRequestId(meta.requestId());
    log.setIp(meta.ip());
    log.setUserAgent(meta.userAgent());

    auditLogRepository.save(log);
  }

  @Transactional(readOnly = true)
  public List<AuditLogEntity> list(UUID propertyId) {
    if (propertyId == null) {
      return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
    return auditLogRepository.findAllByPropertyIdOrderByCreatedAtDesc(propertyId);
  }

  private JsonNode serialize(Object value) {
    if (value == null) {
      return null;
    }
    return objectMapper.valueToTree(value);
  }

  private RequestMeta getRequestMeta() {
    if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs)) {
      return new RequestMeta(null, null, null);
    }
    HttpServletRequest request = attrs.getRequest();
    String requestId = request.getHeader("X-Request-Id");
    String userAgent = request.getHeader("User-Agent");
    String ip = request.getHeader("X-Forwarded-For");
    if (ip == null || ip.isBlank()) {
      ip = request.getRemoteAddr();
    }
    return new RequestMeta(requestId, ip, userAgent);
  }

  private UUID resolveActorUserId() {
    return currentUserProvider.getCurrentUserId()
        .filter(id -> rbacUserRepository.findByIdAndDeletedAtIsNull(id).isPresent())
        .orElse(null);
  }

  private record RequestMeta(String requestId, String ip, String userAgent) {}
}
