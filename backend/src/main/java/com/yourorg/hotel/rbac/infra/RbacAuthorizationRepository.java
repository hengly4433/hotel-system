package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacPermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface RbacAuthorizationRepository extends JpaRepository<RbacPermissionEntity, UUID> {

  @Query("select concat(p.resource, '.', p.action) " +
      "from RbacPermissionEntity p " +
      "join RbacRolePermissionEntity rp on rp.id.permissionId = p.id " +
      "join RbacUserRoleEntity ur on ur.id.roleId = rp.id.roleId " +
      "where ur.id.userId = :userId and p.deletedAt is null")
  List<String> findPermissionCodesByUserId(@Param("userId") UUID userId);

  @Query("select distinct rp.id.permissionId from RbacRolePermissionEntity rp where rp.id.roleId in :roleIds")
  List<UUID> findPermissionIdsByRoleIds(@Param("roleIds") List<UUID> roleIds);
}
