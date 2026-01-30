package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacUserRoleEntity;
import com.yourorg.hotel.rbac.domain.RbacUserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RbacUserRoleRepository extends JpaRepository<RbacUserRoleEntity, RbacUserRoleId> {
  List<RbacUserRoleEntity> findByIdUserId(UUID userId);

  List<RbacUserRoleEntity> findByIdUserIdIn(Collection<UUID> userIds);

  @Modifying
  @Query("delete from RbacUserRoleEntity ur where ur.id.userId = :userId")
  void deleteByUserId(@Param("userId") UUID userId);

  @Query("select ur.id.roleId from RbacUserRoleEntity ur where ur.id.userId = :userId")
  List<UUID> findRoleIdsByUserId(@Param("userId") UUID userId);
}
