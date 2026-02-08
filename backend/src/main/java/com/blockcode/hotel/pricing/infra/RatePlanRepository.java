package com.blockcode.hotel.pricing.infra;

import com.blockcode.hotel.pricing.domain.RatePlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RatePlanRepository extends JpaRepository<RatePlanEntity, UUID> {
  Optional<RatePlanEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RatePlanEntity> findAllByDeletedAtIsNullOrderByNameAsc();

  List<RatePlanEntity> findAllByPropertyIdAndDeletedAtIsNullOrderByNameAsc(UUID propertyId);

  boolean existsByPropertyIdAndCodeAndDeletedAtIsNull(UUID propertyId, String code);
}
