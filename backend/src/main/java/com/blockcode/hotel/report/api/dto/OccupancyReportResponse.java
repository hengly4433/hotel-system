package com.blockcode.hotel.report.api.dto;

import java.time.LocalDate;

public record OccupancyReportResponse(
        LocalDate date,
        long totalRooms,
        long occupiedRooms,
        double occupancyPercentage) {
}
