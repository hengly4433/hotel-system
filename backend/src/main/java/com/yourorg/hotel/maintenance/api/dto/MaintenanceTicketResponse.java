package com.yourorg.hotel.maintenance.api.dto;

import com.yourorg.hotel.maintenance.domain.MaintenancePriority;
import com.yourorg.hotel.maintenance.domain.MaintenanceStatus;

import java.time.Instant;
import java.util.UUID;

public record MaintenanceTicketResponse(
    UUID id,
    UUID propertyId,
    UUID roomId,
    MaintenancePriority priority,
    MaintenanceStatus status,
    String description,
    UUID reportedByUserId,
    UUID assignedToEmployeeId,
    Instant openedAt,
    Instant closedAt,
    Instant dueAt
) {
}
