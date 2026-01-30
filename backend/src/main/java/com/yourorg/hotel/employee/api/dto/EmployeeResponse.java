package com.yourorg.hotel.employee.api.dto;

import com.yourorg.hotel.employee.domain.EmploymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeResponse(
    UUID id,
    UUID personId,
    UUID propertyId,
    String firstName,
    String lastName,
    LocalDate dob,
    String phone,
    String email,
    String addressLine1,
    String addressLine2,
    String city,
    String state,
    String postalCode,
    String country,
    String jobTitle,
    String department,
    LocalDate hireDate,
    BigDecimal hourlyRate,
    String skills,
    String photoUrl,
    EmploymentStatus employmentStatus
) {
}
