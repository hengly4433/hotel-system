package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacRolePermissionEntity;
import com.yourorg.hotel.rbac.domain.RbacRolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RbacRolePermissionRepository extends JpaRepository<RbacRolePermissionEntity, RbacRolePermissionId> {
  List<RbacRolePermissionEntity> findByIdRoleId(UUID roleId);

  List<RbacRolePermissionEntity> findByIdRoleIdIn(Collection<UUID> roleIds);

  @Modifying
  @Query("delete from RbacRolePermissionEntity rp where rp.id.roleId = :roleId")
  void deleteByRoleId(@Param("roleId") UUID roleId);

  @Query("select rp.id.permissionId from RbacRolePermissionEntity rp where rp.id.roleId = :roleId")
  List<UUID> findPermissionIdsByRoleId(@Param("roleId") UUID roleId);
}
