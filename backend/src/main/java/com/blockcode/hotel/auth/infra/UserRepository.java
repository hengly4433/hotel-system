package com.blockcode.hotel.auth.infra;

import com.blockcode.hotel.auth.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
  Optional<UserEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<UserEntity> findAllByDeletedAtIsNullOrderByEmailAsc();

  Optional<UserEntity> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

  boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);
}
