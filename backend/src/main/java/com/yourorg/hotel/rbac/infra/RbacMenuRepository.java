package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacMenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RbacMenuRepository extends JpaRepository<RbacMenuEntity, UUID> {
  Optional<RbacMenuEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RbacMenuEntity> findAllByDeletedAtIsNullOrderBySortOrderAscLabelAsc();

  Optional<RbacMenuEntity> findByKeyAndDeletedAtIsNull(String key);

  boolean existsByKeyAndDeletedAtIsNull(String key);

  List<RbacMenuEntity> findByIdInAndDeletedAtIsNull(java.util.Collection<UUID> ids);
}
