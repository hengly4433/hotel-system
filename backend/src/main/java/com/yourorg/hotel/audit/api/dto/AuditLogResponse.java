package com.yourorg.hotel.audit.api.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
    UUID id,
    UUID propertyId,
    UUID actorUserId,
    String entityType,
    UUID entityId,
    String action,
    JsonNode beforeJson,
    JsonNode afterJson,
    String requestId,
    String ip,
    String userAgent,
    Instant createdAt
) {
}
