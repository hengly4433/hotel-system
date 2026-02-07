package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.MenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuRepository extends JpaRepository<MenuEntity, UUID> {
  Optional<MenuEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<MenuEntity> findAllByDeletedAtIsNullOrderBySortOrderAscLabelAsc();

  Optional<MenuEntity> findByKeyAndDeletedAtIsNull(String key);

  boolean existsByKeyAndDeletedAtIsNull(String key);

  List<MenuEntity> findByIdInAndDeletedAtIsNull(java.util.Collection<UUID> ids);
}
