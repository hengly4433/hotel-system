package com.yourorg.hotel.maintenance.api.dto;

import com.yourorg.hotel.maintenance.domain.MaintenanceStatus;

import java.time.Instant;
import java.util.UUID;

public record MaintenanceTicketEventResponse(
    UUID id,
    UUID ticketId,
    MaintenanceStatus status,
    UUID changedByUserId,
    Instant changedAt
) {
}
