package com.blockcode.hotel.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AppException.class)
  public ResponseEntity<AppExceptionResponse> handleApp(AppException e) {
    return ResponseEntity
        .status(e.getStatus())
        .body(AppExceptionResponse.of(e.getCode(), e.getMessage(), e.getDetails()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Object> handleValidation(MethodArgumentNotValidException e) {
    Map<String, List<String>> errors = new LinkedHashMap<>();
    for (FieldError fe : e.getBindingResult().getFieldErrors()) {
      errors.computeIfAbsent(fe.getField(), k -> new ArrayList<>()).add(fe.getDefaultMessage());
    }

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", java.time.Instant.now().toString());
    body.put("code", "VALIDATION_ERROR");
    body.put("message", "Invalid request");
    body.put("fields", errors);

    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<AppExceptionResponse> handleAny(Exception e) {
    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(AppExceptionResponse.of("INTERNAL_ERROR", "Unexpected error", null));
  }
}
