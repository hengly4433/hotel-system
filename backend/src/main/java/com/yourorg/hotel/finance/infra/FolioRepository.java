package com.yourorg.hotel.finance.infra;

import com.yourorg.hotel.finance.domain.FolioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FolioRepository extends JpaRepository<FolioEntity, UUID> {
  Optional<FolioEntity> findByIdAndDeletedAtIsNull(UUID id);

  Optional<FolioEntity> findByReservationIdAndDeletedAtIsNull(UUID reservationId);

  List<FolioEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();
}
