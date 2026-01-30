package com.yourorg.hotel.pricing.infra;

import com.yourorg.hotel.pricing.domain.CancellationPolicyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CancellationPolicyRepository extends JpaRepository<CancellationPolicyEntity, UUID> {
  Optional<CancellationPolicyEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<CancellationPolicyEntity> findAllByDeletedAtIsNullOrderByNameAsc();

  boolean existsByPropertyIdAndNameIgnoreCaseAndDeletedAtIsNull(UUID propertyId, String name);
}
