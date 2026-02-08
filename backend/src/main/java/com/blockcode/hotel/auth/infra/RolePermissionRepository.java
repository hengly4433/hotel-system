package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.RolePermissionEntity;
import com.blockcode.hotel.auth.domain.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RolePermissionRepository extends JpaRepository<RolePermissionEntity, RolePermissionId> {
  List<RolePermissionEntity> findByIdRoleId(UUID roleId);

  List<RolePermissionEntity> findByIdRoleIdIn(Collection<UUID> roleIds);

  @Modifying
  @Query("delete from RolePermissionEntity rp where rp.id.roleId = :roleId")
  void deleteByRoleId(@Param("roleId") UUID roleId);

  @Query("select rp.id.permissionId from RolePermissionEntity rp where rp.id.roleId = :roleId")
  List<UUID> findPermissionIdsByRoleId(@Param("roleId") UUID roleId);
}
