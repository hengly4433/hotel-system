package com.blockcode.hotel.report.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenueReportResponse(
        LocalDate date,
        String paymentMethod,
        BigDecimal totalAmount,
        long transactionCount) {
}
