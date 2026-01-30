package com.yourorg.hotel.property.infra;

import com.yourorg.hotel.property.domain.PropertyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<PropertyEntity, UUID> {
  Optional<PropertyEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<PropertyEntity> findAllByDeletedAtIsNullOrderByNameAsc();

  boolean existsByOrganizationIdAndNameIgnoreCaseAndDeletedAtIsNull(UUID organizationId, String name);
}
