package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {
  Optional<RoleEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RoleEntity> findAllByDeletedAtIsNullOrderByNameAsc();

  Optional<RoleEntity> findByPropertyIdAndNameAndDeletedAtIsNull(UUID propertyId, String name);

  long countByIdInAndDeletedAtIsNull(Collection<UUID> ids);
}
