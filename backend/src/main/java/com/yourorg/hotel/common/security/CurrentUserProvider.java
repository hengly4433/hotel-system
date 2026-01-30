package com.yourorg.hotel.common.security;

import java.util.Optional;
import java.util.UUID;

public interface CurrentUserProvider {
  Optional<UUID> getCurrentUserId();

  UUID getRequiredUserId();
}
