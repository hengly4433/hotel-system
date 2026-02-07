package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<PermissionEntity, UUID> {
  Optional<PermissionEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<PermissionEntity> findAllByDeletedAtIsNullOrderByResourceAscActionAsc();

  long countByIdInAndDeletedAtIsNull(Collection<UUID> ids);

  @Query("select case when count(p) > 0 then true else false end from PermissionEntity p " +
      "where p.deletedAt is null and p.resource = :resource and p.action = :action " +
      "and ((:scope is null and p.scope is null) or p.scope = :scope)")
  boolean existsActive(@Param("resource") String resource,
                       @Param("action") String action,
                       @Param("scope") String scope);
}
