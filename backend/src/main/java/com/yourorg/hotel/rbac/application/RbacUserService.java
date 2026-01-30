package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.UserCreateRequest;
import com.yourorg.hotel.rbac.api.dto.UserPasswordRequest;
import com.yourorg.hotel.rbac.api.dto.UserResponse;
import com.yourorg.hotel.rbac.api.dto.UserRolesReplaceRequest;
import com.yourorg.hotel.rbac.api.dto.UserUpdateRequest;
import com.yourorg.hotel.rbac.api.mapper.UserMapper;
import com.yourorg.hotel.rbac.domain.RbacUserEntity;
import com.yourorg.hotel.rbac.domain.RbacUserRoleEntity;
import com.yourorg.hotel.rbac.domain.RbacUserRoleId;
import com.yourorg.hotel.rbac.domain.UserStatus;
import com.yourorg.hotel.rbac.infra.RbacRoleRepository;
import com.yourorg.hotel.rbac.infra.RbacUserRepository;
import com.yourorg.hotel.rbac.infra.RbacUserRoleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RbacUserService {
  private final RbacUserRepository userRepository;
  private final RbacRoleRepository roleRepository;
  private final RbacUserRoleRepository userRoleRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;

  public RbacUserService(
      RbacUserRepository userRepository,
      RbacRoleRepository roleRepository,
      RbacUserRoleRepository userRoleRepository,
      UserMapper userMapper,
      PasswordEncoder passwordEncoder
  ) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.userMapper = userMapper;
    this.passwordEncoder = passwordEncoder;
  }

  public UserResponse create(UserCreateRequest request) {
    if (userRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(request.email())) {
      throw new AppException("USER_EXISTS", "Email already exists", HttpStatus.BAD_REQUEST);
    }

    RbacUserEntity user = new RbacUserEntity();
    user.setEmail(request.email());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setStatus(request.status() == null ? UserStatus.ACTIVE : request.status());
    user.setPropertyId(request.propertyId());

    userRepository.save(user);

    List<UUID> roleIds = normalizeIds(request.roleIds());
    replaceRolesInternal(user.getId(), roleIds);

    return toResponse(user, roleIds);
  }

  @Transactional(readOnly = true)
  public List<UserResponse> list() {
    List<RbacUserEntity> users = userRepository.findAllByDeletedAtIsNullOrderByEmailAsc();
    if (users.isEmpty()) {
      return List.of();
    }

    List<UUID> userIds = users.stream().map(RbacUserEntity::getId).toList();
    Map<UUID, List<UUID>> roleIdsByUser = new HashMap<>();
    userRoleRepository.findByIdUserIdIn(userIds).forEach(mapping -> {
      roleIdsByUser.computeIfAbsent(mapping.getId().getUserId(), k -> new ArrayList<>())
          .add(mapping.getId().getRoleId());
    });

    return users.stream()
        .map(user -> toResponse(user, roleIdsByUser.getOrDefault(user.getId(), List.of())))
        .toList();
  }

  @Transactional(readOnly = true)
  public UserResponse get(UUID id) {
    RbacUserEntity user = userRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

    List<UUID> roleIds = userRoleRepository.findRoleIdsByUserId(id);
    return toResponse(user, roleIds);
  }

  public UserResponse update(UUID id, UserUpdateRequest request) {
    RbacUserEntity user = userRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

    if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
      if (userRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(request.email())) {
        throw new AppException("USER_EXISTS", "Email already exists", HttpStatus.BAD_REQUEST);
      }
      user.setEmail(request.email());
    }

    if (request.status() != null) {
      user.setStatus(request.status());
    }

    if (request.propertyId() != null) {
      user.setPropertyId(request.propertyId());
    }

    userRepository.save(user);

    List<UUID> roleIds = userRoleRepository.findRoleIdsByUserId(id);
    return toResponse(user, roleIds);
  }

  public void updatePassword(UUID id, UserPasswordRequest request) {
    RbacUserEntity user = userRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    userRepository.save(user);
  }

  public List<UUID> replaceRoles(UUID userId, UserRolesReplaceRequest request) {
    userRepository.findByIdAndDeletedAtIsNull(userId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

    List<UUID> roleIds = normalizeIds(request.roleIds());
    replaceRolesInternal(userId, roleIds);
    return roleIds;
  }

  public void softDelete(UUID id) {
    RbacUserEntity user = userRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));
    user.setDeletedAt(Instant.now());
    userRepository.save(user);
  }

  private void replaceRolesInternal(UUID userId, List<UUID> roleIds) {
    if (!roleIds.isEmpty()) {
      long count = roleRepository.countByIdInAndDeletedAtIsNull(roleIds);
      if (count != roleIds.size()) {
        throw new AppException("ROLE_NOT_FOUND", "One or more roles do not exist", HttpStatus.BAD_REQUEST);
      }
    }

    userRoleRepository.deleteByUserId(userId);

    if (roleIds.isEmpty()) {
      return;
    }

    List<RbacUserRoleEntity> mappings = roleIds.stream()
        .distinct()
        .map(roleId -> new RbacUserRoleEntity(new RbacUserRoleId(userId, roleId)))
        .toList();

    userRoleRepository.saveAll(mappings);
  }

  private List<UUID> normalizeIds(List<UUID> ids) {
    if (ids == null) {
      return Collections.emptyList();
    }
    return ids.stream().distinct().collect(Collectors.toList());
  }

  private UserResponse toResponse(RbacUserEntity user, List<UUID> roleIds) {
    UserResponse base = userMapper.toResponse(user);
    return new UserResponse(base.id(), base.email(), base.status(), base.propertyId(), roleIds);
  }
}
