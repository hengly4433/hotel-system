package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RbacUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RbacUserRepository extends JpaRepository<RbacUserEntity, UUID> {
  Optional<RbacUserEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RbacUserEntity> findAllByDeletedAtIsNullOrderByEmailAsc();

  Optional<RbacUserEntity> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

  boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);
}
