package com.yourorg.hotel.common.security;

import com.yourorg.hotel.common.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class SecurityContextUserProvider implements CurrentUserProvider {
  @Override
  public Optional<UUID> getCurrentUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      return Optional.empty();
    }

    Object principal = auth.getPrincipal();
    if (principal instanceof UUID uuid) {
      return Optional.of(uuid);
    }

    String name = auth.getName();
    if (name == null || name.isBlank()) {
      return Optional.empty();
    }

    try {
      return Optional.of(UUID.fromString(name));
    } catch (IllegalArgumentException ex) {
      return Optional.empty();
    }
  }

  @Override
  public UUID getRequiredUserId() {
    return getCurrentUserId().orElseThrow(() ->
        new AppException("UNAUTHORIZED", "Unauthorized", HttpStatus.UNAUTHORIZED)
    );
  }
}
