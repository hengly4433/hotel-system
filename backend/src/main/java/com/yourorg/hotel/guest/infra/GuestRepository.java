package com.yourorg.hotel.guest.infra;

import com.yourorg.hotel.guest.domain.GuestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GuestRepository extends JpaRepository<GuestEntity, UUID> {
  Optional<GuestEntity> findByIdAndDeletedAtIsNull(UUID id);

  Optional<GuestEntity> findByPersonIdAndDeletedAtIsNull(UUID personId);

  List<GuestEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

  List<GuestEntity> findAllByPersonIdInAndDeletedAtIsNull(Collection<UUID> personIds);
}
