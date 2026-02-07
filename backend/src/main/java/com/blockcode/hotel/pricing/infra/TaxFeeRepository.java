package com.blockcode.hotel.pricing.infra;

import com.blockcode.hotel.pricing.domain.TaxFeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaxFeeRepository extends JpaRepository<TaxFeeEntity, UUID> {
  Optional<TaxFeeEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<TaxFeeEntity> findAllByDeletedAtIsNullOrderByNameAsc();

  List<TaxFeeEntity> findAllByPropertyIdAndActiveTrueAndDeletedAtIsNull(UUID propertyId);

  boolean existsByPropertyIdAndNameAndDeletedAtIsNull(UUID propertyId, String name);
}
