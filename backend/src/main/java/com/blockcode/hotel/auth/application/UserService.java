package com.blockcode.hotel.auth.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.auth.api.dto.UserCreateRequest;
import com.blockcode.hotel.auth.api.dto.UserPasswordRequest;
import com.blockcode.hotel.auth.api.dto.UserResponse;
import com.blockcode.hotel.auth.api.dto.UserRolesReplaceRequest;
import com.blockcode.hotel.auth.api.dto.UserUpdateRequest;
import com.blockcode.hotel.auth.api.mapper.UserMapper;
import com.blockcode.hotel.auth.domain.UserEntity;
import com.blockcode.hotel.auth.domain.UserRoleEntity;
import com.blockcode.hotel.auth.domain.UserRoleId;
import com.blockcode.hotel.auth.domain.UserStatus;
import com.blockcode.hotel.auth.infra.RoleRepository;
import com.blockcode.hotel.auth.infra.UserRepository;
import com.blockcode.hotel.auth.infra.UserRoleRepository;
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
public class UserService {
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final UserRoleRepository userRoleRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;

  public UserService(
      UserRepository userRepository,
      RoleRepository roleRepository,
      UserRoleRepository userRoleRepository,
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

    UserEntity user = new UserEntity();
    user.setEmail(request.email());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setStatus(request.status() == null ? UserStatus.ACTIVE : request.status());
    user.setPropertyId(request.propertyId());
    user.setFirstName(request.firstName());
    user.setLastName(request.lastName());
    user.setProfileImage(request.profileImage());

    userRepository.save(user);

    List<UUID> roleIds = normalizeIds(request.roleIds());
    replaceRolesInternal(user.getId(), roleIds);

    return toResponse(user, roleIds);
  }

  @Transactional(readOnly = true)
  public List<UserResponse> list() {
    List<UserEntity> users = userRepository.findAllByDeletedAtIsNullOrderByEmailAsc();
    if (users.isEmpty()) {
      return List.of();
    }

    List<UUID> userIds = users.stream().map(UserEntity::getId).toList();
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
    UserEntity user = userRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));

    List<UUID> roleIds = userRoleRepository.findRoleIdsByUserId(id);
    return toResponse(user, roleIds);
  }

  public UserResponse update(UUID id, UserUpdateRequest request) {
    UserEntity user = userRepository.findByIdAndDeletedAtIsNull(id)
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

    if (request.firstName() != null) {
      user.setFirstName(request.firstName());
    }
    if (request.lastName() != null) {
      user.setLastName(request.lastName());
    }
    if (request.profileImage() != null) {
      user.setProfileImage(request.profileImage());
    }

    userRepository.save(user);

    List<UUID> roleIds = userRoleRepository.findRoleIdsByUserId(id);
    return toResponse(user, roleIds);
  }

  public void updatePassword(UUID id, UserPasswordRequest request) {
    UserEntity user = userRepository.findByIdAndDeletedAtIsNull(id)
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
    UserEntity user = userRepository.findByIdAndDeletedAtIsNull(id)
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

    List<UserRoleEntity> mappings = roleIds.stream()
        .distinct()
        .map(roleId -> new UserRoleEntity(new UserRoleId(userId, roleId)))
        .toList();

    userRoleRepository.saveAll(mappings);
  }

  private List<UUID> normalizeIds(List<UUID> ids) {
    if (ids == null) {
      return Collections.emptyList();
    }
    return ids.stream().distinct().collect(Collectors.toList());
  }

  private UserResponse toResponse(UserEntity user, List<UUID> roleIds) {
    UserResponse base = userMapper.toResponse(user);
    return new UserResponse(
        base.id(),
        base.email(),
        base.firstName(),
        base.lastName(),
        base.profileImage(),
        base.status(),
        base.propertyId(),
        roleIds
    );
  }
}
