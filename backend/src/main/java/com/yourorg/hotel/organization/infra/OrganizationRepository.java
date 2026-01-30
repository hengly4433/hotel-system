package com.yourorg.hotel.organization.infra;

import com.yourorg.hotel.organization.domain.OrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<OrganizationEntity, UUID> {
  Optional<OrganizationEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<OrganizationEntity> findAllByDeletedAtIsNullOrderByNameAsc();

  boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);
}
