package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacRoleSubmenuEntity;
import com.yourorg.hotel.rbac.domain.RbacRoleSubmenuId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RbacRoleSubmenuRepository extends JpaRepository<RbacRoleSubmenuEntity, RbacRoleSubmenuId> {
  List<RbacRoleSubmenuEntity> findByIdRoleId(UUID roleId);

  List<RbacRoleSubmenuEntity> findByIdRoleIdIn(Collection<UUID> roleIds);

  @Modifying
  @Query("delete from RbacRoleSubmenuEntity rs where rs.id.roleId = :roleId")
  void deleteByRoleId(@Param("roleId") UUID roleId);

  @Query("select rs.id.submenuId from RbacRoleSubmenuEntity rs where rs.id.roleId = :roleId")
  List<UUID> findSubmenuIdsByRoleId(@Param("roleId") UUID roleId);

  @Query("select rs.id.submenuId from RbacRoleSubmenuEntity rs where rs.id.roleId in :roleIds")
  List<UUID> findSubmenuIdsByRoleIds(@Param("roleIds") Collection<UUID> roleIds);
}
