package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.UserRoleEntity;
import com.blockcode.hotel.auth.domain.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRoleEntity, UserRoleId> {
  List<UserRoleEntity> findByIdUserId(UUID userId);

  List<UserRoleEntity> findByIdUserIdIn(Collection<UUID> userIds);

  @Modifying
  @Query("delete from UserRoleEntity ur where ur.id.userId = :userId")
  void deleteByUserId(@Param("userId") UUID userId);

  @Query("select ur.id.roleId from UserRoleEntity ur where ur.id.userId = :userId")
  List<UUID> findRoleIdsByUserId(@Param("userId") UUID userId);
}
