package com.blockcode.hotel.reservation.application;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NightlyCharge(
    LocalDate date,
    BigDecimal price,
    String currency
) {
}
