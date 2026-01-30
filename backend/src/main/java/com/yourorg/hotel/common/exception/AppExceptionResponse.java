package com.yourorg.hotel.common.exception;

import java.time.Instant;

public record AppExceptionResponse(
    String timestamp,
    String code,
    String message,
    Object details
) {
  public static AppExceptionResponse of(String code, String message, Object details) {
    return new AppExceptionResponse(Instant.now().toString(), code, message, details);
  }
}
