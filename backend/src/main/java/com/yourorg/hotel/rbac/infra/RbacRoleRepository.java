package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RbacRoleRepository extends JpaRepository<RbacRoleEntity, UUID> {
  Optional<RbacRoleEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RbacRoleEntity> findAllByDeletedAtIsNullOrderByNameAsc();

  Optional<RbacRoleEntity> findByPropertyIdAndNameAndDeletedAtIsNull(UUID propertyId, String name);

  long countByIdInAndDeletedAtIsNull(Collection<UUID> ids);
}
