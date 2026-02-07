package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.SubmenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmenuRepository extends JpaRepository<SubmenuEntity, UUID> {
  Optional<SubmenuEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<SubmenuEntity> findAllByDeletedAtIsNullOrderByMenuIdAscSortOrderAsc();

  Optional<SubmenuEntity> findByMenuIdAndKeyAndDeletedAtIsNull(UUID menuId, String key);

  List<SubmenuEntity> findByIdInAndDeletedAtIsNull(Collection<UUID> ids);

  long countByIdInAndDeletedAtIsNull(Collection<UUID> ids);
}
