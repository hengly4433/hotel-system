package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.RoleSubmenuEntity;
import com.blockcode.hotel.auth.domain.RoleSubmenuId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RoleSubmenuRepository extends JpaRepository<RoleSubmenuEntity, RoleSubmenuId> {
  List<RoleSubmenuEntity> findByIdRoleId(UUID roleId);

  List<RoleSubmenuEntity> findByIdRoleIdIn(Collection<UUID> roleIds);

  @Modifying
  @Query("delete from RoleSubmenuEntity rs where rs.id.roleId = :roleId")
  void deleteByRoleId(@Param("roleId") UUID roleId);

  @Query("select rs.id.submenuId from RoleSubmenuEntity rs where rs.id.roleId = :roleId")
  List<UUID> findSubmenuIdsByRoleId(@Param("roleId") UUID roleId);

  @Query("select rs.id.submenuId from RoleSubmenuEntity rs where rs.id.roleId in :roleIds")
  List<UUID> findSubmenuIdsByRoleIds(@Param("roleIds") Collection<UUID> roleIds);
}
