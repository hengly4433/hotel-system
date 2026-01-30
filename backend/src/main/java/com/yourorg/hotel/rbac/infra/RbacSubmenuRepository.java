package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacSubmenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RbacSubmenuRepository extends JpaRepository<RbacSubmenuEntity, UUID> {
  Optional<RbacSubmenuEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RbacSubmenuEntity> findAllByDeletedAtIsNullOrderByMenuIdAscSortOrderAsc();

  Optional<RbacSubmenuEntity> findByMenuIdAndKeyAndDeletedAtIsNull(UUID menuId, String key);

  List<RbacSubmenuEntity> findByIdInAndDeletedAtIsNull(Collection<UUID> ids);

  long countByIdInAndDeletedAtIsNull(Collection<UUID> ids);
}
