package com.blockcode.hotel.finance.api.dto;

import com.blockcode.hotel.finance.domain.FolioItemType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FolioItemCreateRequest(
    @NotNull FolioItemType type,
    @NotBlank String description,
    @NotNull @DecimalMin("0.0") BigDecimal qty,
    @NotNull @DecimalMin("0.0") BigDecimal unitPrice
) {
}
