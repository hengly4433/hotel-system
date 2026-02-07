package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AuthorizationRepository extends JpaRepository<PermissionEntity, UUID> {

  @Query("select concat(p.resource, '.', p.action) " +
      "from PermissionEntity p " +
      "join RolePermissionEntity rp on rp.id.permissionId = p.id " +
      "join UserRoleEntity ur on ur.id.roleId = rp.id.roleId " +
      "where ur.id.userId = :userId and p.deletedAt is null")
  List<String> findPermissionCodesByUserId(@Param("userId") UUID userId);

  @Query("select distinct rp.id.permissionId from RolePermissionEntity rp where rp.id.roleId in :roleIds")
  List<UUID> findPermissionIdsByRoleIds(@Param("roleIds") List<UUID> roleIds);
}
