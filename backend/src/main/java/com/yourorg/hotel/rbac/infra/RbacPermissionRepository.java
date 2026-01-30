package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacPermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RbacPermissionRepository extends JpaRepository<RbacPermissionEntity, UUID> {
  Optional<RbacPermissionEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RbacPermissionEntity> findAllByDeletedAtIsNullOrderByResourceAscActionAsc();

  long countByIdInAndDeletedAtIsNull(Collection<UUID> ids);

  @Query("select case when count(p) > 0 then true else false end from RbacPermissionEntity p " +
      "where p.deletedAt is null and p.resource = :resource and p.action = :action " +
      "and ((:scope is null and p.scope is null) or p.scope = :scope)")
  boolean existsActive(@Param("resource") String resource,
                       @Param("action") String action,
                       @Param("scope") String scope);
}
