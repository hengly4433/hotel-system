package com.blockcode.hotel.report.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PayrollReportResponse(
    UUID employeeId,
    String employeeName,
    String jobTitle,
    String department,
    BigDecimal hourlyRate,
    int totalMinutes,
    BigDecimal totalPay
) {
}
