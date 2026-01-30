package com.yourorg.hotel.employee.api.dto;

import com.yourorg.hotel.employee.domain.EmploymentStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeRequest(
    @NotNull UUID propertyId,
    @NotBlank String firstName,
    @NotBlank String lastName,
    LocalDate dob,
    String phone,
    @Email String email,
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
