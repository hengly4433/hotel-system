package com.yourorg.hotel.maintenance.api.dto;

import com.yourorg.hotel.maintenance.domain.MaintenancePriority;
import com.yourorg.hotel.maintenance.domain.MaintenanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record MaintenanceTicketRequest(
    @NotNull UUID propertyId,
    @NotNull UUID roomId,
    MaintenancePriority priority,
    MaintenanceStatus status,
    @NotBlank String description,
    UUID reportedByUserId,
    UUID assignedToEmployeeId,
    Instant openedAt,
    Instant closedAt,
    Instant dueAt
) {
}
