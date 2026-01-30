Continue from the previous prompt: 003_Initialize_Project_3.md


# below is a complete RBAC CRUD API module for Spring Boot 3.5.x + Gradle + PostgreSQL with enterprise layering:

- Controller (API) → Service (Use Case) → Repository (Infra)
- DTOs + Validation
- MapStruct Mappers
- RBAC enforcement via @PreAuthorize("hasAuthority('rbac.ADMIN')")
- Menu visibility rule support via /api/v1/me/navigation (already provided earlier)
- Role Permission Picker API (grouped by resource)
- Role Submenu Picker API (menus tree with checked submenus)

### ⚠️ Note: JPA column naming in entities must match DB columns (snake_case). Below uses @Column(name="...") consistently.

## RBAC API endpoints (what you get)

- All secured by rbac.ADMIN unless stated:

### Users

- POST /api/v1/rbac/users (create user + assign roles)
- GET /api/v1/rbac/users (list)
- GET /api/v1/rbac/users/{id} (detail)
- PUT /api/v1/rbac/users/{id} (update profile/status)
- PUT /api/v1/rbac/users/{id}/password (change password)
- PUT /api/v1/rbac/users/{id}/roles (replace roles)
- DELETE /api/v1/rbac/users/{id} (soft delete)

### Roles

- POST /api/v1/rbac/roles
- GET /api/v1/rbac/roles
- GET /api/v1/rbac/roles/{id}
- PUT /api/v1/rbac/roles/{id}
- DELETE /api/v1/rbac/roles/{id}
- GET /api/v1/rbac/roles/{id}/permissions
- PUT /api/v1/rbac/roles/{id}/permissions (replace)
- GET /api/v1/rbac/roles/{id}/submenus
- PUT /api/v1/rbac/roles/{id}/submenus (replace)

### Menus / Submenus

- POST /api/v1/rbac/menus
- GET /api/v1/rbac/menus
- PUT /api/v1/rbac/menus/{id}
- DELETE /api/v1/rbac/menus/{id}
- POST /api/v1/rbac/submenus
- GET /api/v1/rbac/submenus
- PUT /api/v1/rbac/submenus/{id}
- DELETE /api/v1/rbac/submenus/{id}

### Permissions

- POST /api/v1/rbac/permissions
- GET /api/v1/rbac/permissions
- PUT /api/v1/rbac/permissions/{id}
- DELETE /api/v1/rbac/permissions/{id}

### Picker helpers

- GET /api/v1/rbac/pickers/permissions-grouped ✅ Role permission picker
- GET /api/v1/rbac/pickers/menu-tree ✅ Role submenu picker base tree

## Common: Exception + Global Handler (enterprise-grade)

### common/exception/AppException.java

```java
package com.yourorg.hotel.common.exception;

import org.springframework.http.HttpStatus;

public class AppException extends RuntimeException {
  private final String code;
  private final HttpStatus status;
  private final Object details;

  public AppException(String code, String message, HttpStatus status, Object details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }

  public AppException(String code, String message, HttpStatus status) {
    this(code, message, status, null);
  }

  public String getCode() { return code; }
  public HttpStatus getStatus() { return status; }
  public Object getDetails() { return details; }
}
```

### common/exception/GlobalExceptionHandler.java

```java
package com.yourorg.hotel.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AppException.class)
  public ResponseEntity<Object> handleAppException(AppException ex) {
    return new ResponseEntity<>(
      new AppExceptionResponse(ex.getCode(), ex.getMessage(), ex.getStatus(), ex.getDetails()),
      ex.getStatus()
    );
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> handleException(Exception ex) {
    return new ResponseEntity<>(
      new AppExceptionResponse("INTERNAL_SERVER_ERROR", ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null),
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

```

### common/exception/AppExceptionResponse.java

```java
package com.yourorg.hotel.common.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AppException.class)
  public ResponseEntity<?> handleApp(AppException e) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("code", e.getCode());
    body.put("message", e.getMessage());
    body.put("details", e.getDetails());
    return ResponseEntity.status(e.getStatus()).body(body);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
    Map<String, List<String>> errors = new LinkedHashMap<>();
    for (FieldError fe : e.getBindingResult().getFieldErrors()) {
      errors.computeIfAbsent(fe.getField(), k -> new ArrayList<>()).add(fe.getDefaultMessage());
    }
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("code", "VALIDATION_ERROR");
    body.put("message", "Invalid request");
    body.put("fields", errors);
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleAny(Exception e) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("code", "INTERNAL_ERROR");
    body.put("message", "Unexpected error");
    return ResponseEntity.status(500).body(body);
  }
}
```

## Infra: Repositories

### rbac/infra/RoleRepository.java

```java
package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.RoleEntity;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {

  Optional<RoleEntity> findByIdAndDeletedAtIsNull(UUID id);

  @Query("select r from RoleEntity r where r.deletedAt is null order by r.name asc")
  List<RoleEntity> findAllActive();
}
```

### rbac/infra/PermissionRepository.java

```java
package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.PermissionEntity;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface PermissionRepository extends JpaRepository<PermissionEntity, UUID> {
  Optional<PermissionEntity> findByIdAndDeletedAtIsNull(UUID id);

  @Query("select p from PermissionEntity p where p.deletedAt is null order by p.resource asc, p.action asc")
  List<PermissionEntity> findAllActive();
}
```

### rbac/infra/MenuRepository.java

```java
package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.MenuEntity;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface MenuRepository extends JpaRepository<MenuEntity, UUID> {
  Optional<MenuEntity> findByIdAndDeletedAtIsNull(UUID id);

  @Query("select m from MenuEntity m where m.deletedAt is null order by m.sortOrder asc")
  List<MenuEntity> findAllActive();
}

```

### rbac/infra/SubmenuRepository.java

```java
package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.SubmenuEntity;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface SubmenuRepository extends JpaRepository<SubmenuEntity, UUID> {
  Optional<SubmenuEntity> findByIdAndDeletedAtIsNull(UUID id);

  @EntityGraph(attributePaths = {"menu"})
  @Query("select s from SubmenuEntity s where s.deletedAt is null order by s.menu.sortOrder asc, s.sortOrder asc")
  List<SubmenuEntity> findAllActiveWithMenu();
}
```

### rbac/infra/UserRepository.java (extended)

```java
package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.UserEntity;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

  @EntityGraph(attributePaths = {"roles", "roles.permissions", "roles.submenus", "roles.submenus.menu"})
  Optional<UserEntity> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

  @EntityGraph(attributePaths = {"roles"})
  Optional<UserEntity> findByIdAndDeletedAtIsNull(UUID id);

  @Query("select u from UserEntity u where u.deletedAt is null order by u.createdAt desc")
  List<UserEntity> findAllActive();
}
```

## DTOs (Requests/Responses) + Validation

### User DTOs

#### rbac/api/dto/UserDtos.java

```java
package com.yourorg.hotel.rbac.api.dto;

import com.yourorg.hotel.rbac.domain.UserStatus;
import jakarta.validation.constraints.*;

import java.util.*;

public class UserDtos {

  public record UserCreateRequest(
      UUID propertyId,
      @Email @NotBlank String email,
      @NotBlank @Size(min = 8) String password,
      @NotNull UserStatus status,
      @NotEmpty List<UUID> roleIds
  ) {}

  public record UserUpdateRequest(
      UUID propertyId,
      @Email @NotBlank String email,
      @NotNull UserStatus status
  ) {}

  public record UserChangePasswordRequest(
      @NotBlank @Size(min = 8) String newPassword
  ) {}

  public record UserReplaceRolesRequest(
      @NotNull List<UUID> roleIds
  ) {}

  public record UserResponse(
      UUID id,
      UUID propertyId,
      String email,
      UserStatus status,
      List<RoleSummary> roles,
      String createdAt,
      String updatedAt
  ) {}

  public record RoleSummary(UUID id, String name) {}
}
```

## Role DTOs

### rbac/api/dto/RoleDtos.java

```java
package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.*;

import java.util.*;

public class RoleDtos {

  public record RoleCreateRequest(
      UUID propertyId,
      @NotBlank String name
  ) {}

  public record RoleUpdateRequest(
      UUID propertyId,
      @NotBlank String name
  ) {}

  public record RoleResponse(
      UUID id,
      UUID propertyId,
      String name,
      String createdAt,
      String updatedAt
  ) {}

  public record ReplacePermissionsRequest(@NotNull List<UUID> permissionIds) {}
  public record ReplaceSubmenusRequest(@NotNull List<UUID> submenuIds) {}
}
```

## Menu/Submenu DTOs

### rbac/api/dto/MenuDtos.java

```java
package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public class MenuDtos {

  public record MenuCreateRequest(
      @NotBlank String key,
      @NotBlank String label,
      @NotNull Integer sortOrder
  ) {}

  public record MenuUpdateRequest(
      @NotBlank String key,
      @NotBlank String label,
      @NotNull Integer sortOrder
  ) {}

  public record MenuResponse(
      UUID id,
      String key,
      String label,
      int sortOrder
  ) {}
}

```

### rbac/api/dto/SubmenuDtos.java

```java
package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public class SubmenuDtos {

  public record SubmenuCreateRequest(
      @NotNull UUID menuId,
      @NotBlank String key,
      @NotBlank String label,
      @NotBlank String route,
      @NotNull Integer sortOrder
  ) {}

  public record SubmenuUpdateRequest(
      @NotNull UUID menuId,
      @NotBlank String key,
      @NotBlank String label,
      @NotBlank String route,
      @NotNull Integer sortOrder
  ) {}

  public record SubmenuResponse(
      UUID id,
      UUID menuId,
      String menuKey,
      String key,
      String label,
      String route,
      int sortOrder
  ) {}
}
```

## Permission DTOs

### rbac/api/dto/PermissionDtos.java

```java
package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public class PermissionDtos {

  public record PermissionCreateRequest(
      @NotBlank String resource,
      @NotBlank String action,
      String scope
  ) {}

  public record PermissionUpdateRequest(
      @NotBlank String resource,
      @NotBlank String action,
      String scope
  ) {}

  public record PermissionResponse(
      UUID id,
      String resource,
      String action,
      String scope,
      String key
  ) {}
}
```

## MapStruct Mappers

### rbac/application/RbacMappers.java

```java
package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.rbac.api.dto.*;
import com.yourorg.hotel.rbac.domain.*;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RbacMappers {

  // User
  @Mapping(target = "roles", expression = "java(user.getRoles().stream().map(r -> new UserDtos.RoleSummary(r.getId(), r.getName())).toList())")
  @Mapping(target = "createdAt", expression = "java(user.getCreatedAt().toString())")
  @Mapping(target = "updatedAt", expression = "java(user.getUpdatedAt().toString())")
  UserDtos.UserResponse toUserResponse(UserEntity user);

  List<UserDtos.UserResponse> toUserResponses(List<UserEntity> users);

  // Role
  @Mapping(target = "createdAt", expression = "java(role.getCreatedAt().toString())")
  @Mapping(target = "updatedAt", expression = "java(role.getUpdatedAt().toString())")
  RoleDtos.RoleResponse toRoleResponse(RoleEntity role);

  List<RoleDtos.RoleResponse> toRoleResponses(List<RoleEntity> roles);

  // Menu
  MenuDtos.MenuResponse toMenuResponse(MenuEntity menu);
  List<MenuDtos.MenuResponse> toMenuResponses(List<MenuEntity> menus);

  // Submenu
  @Mapping(target = "menuId", source = "menu.id")
  @Mapping(target = "menuKey", source = "menu.key")
  SubmenuDtos.SubmenuResponse toSubmenuResponse(SubmenuEntity submenu);

  List<SubmenuDtos.SubmenuResponse> toSubmenuResponses(List<SubmenuEntity> submenus);

  // Permission
  @Mapping(target = "key", expression = "java(p.key())")
  PermissionDtos.PermissionResponse toPermissionResponse(PermissionEntity p);

  List<PermissionDtos.PermissionResponse> toPermissionResponses(List<PermissionEntity> p);
}
```

## Services (Use Cases) — Production logic + soft delete + replace links

### Password hashing bean

#### common/security/PasswordConfig.java

```java
package com.yourorg.hotel.common.security;

import org.springframework.context.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
```

### User Service

#### rbac/application/UserService.java

```java
package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.UserDtos;
import com.yourorg.hotel.rbac.domain.*;
import com.yourorg.hotel.rbac.infra.RoleRepository;
import com.yourorg.hotel.rbac.infra.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

  private final UserRepository users;
  private final RoleRepository roles;
  private final PasswordEncoder encoder;

  public UserService(UserRepository users, RoleRepository roles, PasswordEncoder encoder) {
    this.users = users;
    this.roles = roles;
    this.encoder = encoder;
  }

  @Transactional
  public UserEntity create(UserDtos.UserCreateRequest req) {
    // Check uniqueness (soft delete aware)
    users.findByEmailIgnoreCaseAndDeletedAtIsNull(req.email())
        .ifPresent(u -> { throw new AppException("EMAIL_EXISTS", "Email already exists.", HttpStatus.CONFLICT); });

    var roleEntities = loadRoles(req.roleIds());

    UserEntity u = new UserEntity();
    u.setPropertyId(req.propertyId());
    u.setEmail(req.email());
    u.setPasswordHash(encoder.encode(req.password()));
    u.setStatus(req.status());
    u.setRoles(new HashSet<>(roleEntities));

    return users.save(u);
  }

  @Transactional(readOnly = true)
  public List<UserEntity> list() {
    return users.findAllActive();
  }

  @Transactional(readOnly = true)
  public UserEntity get(UUID id) {
    return users.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "User not found.", HttpStatus.NOT_FOUND));
  }

  @Transactional
  public UserEntity update(UUID id, UserDtos.UserUpdateRequest req) {
    UserEntity u = get(id);

    // if email changes, ensure uniqueness
    if (!u.getEmail().equalsIgnoreCase(req.email())) {
      users.findByEmailIgnoreCaseAndDeletedAtIsNull(req.email())
          .ifPresent(x -> { throw new AppException("EMAIL_EXISTS", "Email already exists.", HttpStatus.CONFLICT); });
    }

    u.setPropertyId(req.propertyId());
    u.setEmail(req.email());
    u.setStatus(req.status());
    return users.save(u);
  }

  @Transactional
  public void changePassword(UUID id, UserDtos.UserChangePasswordRequest req) {
    UserEntity u = get(id);
    u.setPasswordHash(encoder.encode(req.newPassword()));
    users.save(u);
  }

  @Transactional
  public UserEntity replaceRoles(UUID id, UserDtos.UserReplaceRolesRequest req) {
    UserEntity u = get(id);
    var roleEntities = loadRoles(req.roleIds());
    u.setRoles(new HashSet<>(roleEntities));
    return users.save(u);
  }

  @Transactional
  public void softDelete(UUID id) {
    UserEntity u = get(id);
    u.setDeletedAt(Instant.now());
    users.save(u);
  }

  private List<RoleEntity> loadRoles(List<UUID> ids) {
    if (ids == null || ids.isEmpty()) {
      throw new AppException("ROLE_REQUIRED", "At least one role is required.", HttpStatus.BAD_REQUEST);
    }

    var found = roles.findAllById(ids);
    var foundIds = found.stream().map(RoleEntity::getId).collect(Collectors.toSet());

    var missing = ids.stream().filter(x -> !foundIds.contains(x)).toList();
    if (!missing.isEmpty()) {
      throw new AppException("ROLE_NOT_FOUND", "Some roles not found.", HttpStatus.BAD_REQUEST, missing);
    }
    // soft delete check
    if (found.stream().anyMatch(r -> r.getDeletedAt() != null)) {
      throw new AppException("ROLE_INACTIVE", "Some roles are deleted/inactive.", HttpStatus.BAD_REQUEST);
    }
    return found;
  }
}
```

### Role Service (replace permissions/submenus)

#### rbac/application/RoleService.java

```java
package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.RoleDtos;
import com.yourorg.hotel.rbac.domain.*;
import com.yourorg.hotel.rbac.infra.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoleService {

  private final RoleRepository roles;
  private final PermissionRepository permissions;
  private final SubmenuRepository submenus;

  public RoleService(RoleRepository roles, PermissionRepository permissions, SubmenuRepository submenus) {
    this.roles = roles;
    this.permissions = permissions;
    this.submenus = submenus;
  }

  @Transactional
  public RoleEntity create(RoleDtos.RoleCreateRequest req) {
    RoleEntity r = new RoleEntity();
    r.setPropertyId(req.propertyId());
    r.setName(req.name());
    return roles.save(r);
  }

  @Transactional(readOnly = true)
  public List<RoleEntity> list() {
    return roles.findAllActive();
  }

  @Transactional(readOnly = true)
  public RoleEntity get(UUID id) {
    return roles.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Role not found.", HttpStatus.NOT_FOUND));
  }

  @Transactional
  public RoleEntity update(UUID id, RoleDtos.RoleUpdateRequest req) {
    RoleEntity r = get(id);
    r.setPropertyId(req.propertyId());
    r.setName(req.name());
    return roles.save(r);
  }

  @Transactional
  public void softDelete(UUID id) {
    RoleEntity r = get(id);
    r.setDeletedAt(Instant.now());
    roles.save(r);
  }

  @Transactional(readOnly = true)
  public Set<PermissionEntity> getPermissions(UUID roleId) {
    RoleEntity r = get(roleId);
    // lazy may load; ok in tx
    return r.getPermissions();
  }

  @Transactional
  public RoleEntity replacePermissions(UUID roleId, RoleDtos.ReplacePermissionsRequest req) {
    RoleEntity r = get(roleId);
    var perms = loadPermissions(req.permissionIds());
    r.setPermissions(new HashSet<>(perms));
    return roles.save(r);
  }

  @Transactional(readOnly = true)
  public Set<SubmenuEntity> getSubmenus(UUID roleId) {
    RoleEntity r = get(roleId);
    return r.getSubmenus();
  }

  @Transactional
  public RoleEntity replaceSubmenus(UUID roleId, RoleDtos.ReplaceSubmenusRequest req) {
    RoleEntity r = get(roleId);
    var subs = loadSubmenus(req.submenuIds());
    r.setSubmenus(new HashSet<>(subs));
    return roles.save(r);
  }

  private List<PermissionEntity> loadPermissions(List<UUID> ids) {
    if (ids == null) ids = List.of();
    var found = permissions.findAllById(ids);
    var foundIds = found.stream().map(PermissionEntity::getId).collect(Collectors.toSet());
    var missing = ids.stream().filter(x -> !foundIds.contains(x)).toList();
    if (!missing.isEmpty()) throw new AppException("PERMISSION_NOT_FOUND", "Some permissions not found.", HttpStatus.BAD_REQUEST, missing);
    if (found.stream().anyMatch(p -> p.getDeletedAt() != null)) throw new AppException("PERMISSION_INACTIVE", "Some permissions are deleted/inactive.", HttpStatus.BAD_REQUEST);
    return found;
  }

  private List<SubmenuEntity> loadSubmenus(List<UUID> ids) {
    if (ids == null) ids = List.of();
    var found = submenus.findAllById(ids);
    var foundIds = found.stream().map(SubmenuEntity::getId).collect(Collectors.toSet());
    var missing = ids.stream().filter(x -> !foundIds.contains(x)).toList();
    if (!missing.isEmpty()) throw new AppException("SUBMENU_NOT_FOUND", "Some submenus not found.", HttpStatus.BAD_REQUEST, missing);
    if (found.stream().anyMatch(s -> s.getDeletedAt() != null)) throw new AppException("SUBMENU_INACTIVE", "Some submenus are deleted/inactive.", HttpStatus.BAD_REQUEST);
    return found;
  }
}
```

## Menu/Submenu/Permission services (CRUD + soft delete)

### rbac/application/MenuService.java

```java
package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.MenuDtos;
import com.yourorg.hotel.rbac.domain.MenuEntity;
import com.yourorg.hotel.rbac.infra.MenuRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class MenuService {

  private final MenuRepository menus;

  public MenuService(MenuRepository menus) { this.menus = menus; }

  @Transactional
  public MenuEntity create(MenuDtos.MenuCreateRequest req) {
    MenuEntity m = new MenuEntity();
    m.setKey(req.key());
    m.setLabel(req.label());
    m.setSortOrder(req.sortOrder());
    return menus.save(m);
  }

  @Transactional(readOnly = true)
  public List<MenuEntity> list() { return menus.findAllActive(); }

  @Transactional
  public MenuEntity update(UUID id, MenuDtos.MenuUpdateRequest req) {
    MenuEntity m = menus.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND","Menu not found.", HttpStatus.NOT_FOUND));
    m.setKey(req.key());
    m.setLabel(req.label());
    m.setSortOrder(req.sortOrder());
    return menus.save(m);
  }

  @Transactional
  public void softDelete(UUID id) {
    MenuEntity m = menus.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND","Menu not found.", HttpStatus.NOT_FOUND));
    m.setDeletedAt(Instant.now());
    menus.save(m);
  }
}
```

### rbac/application/SubmenuService.java

```java
package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.SubmenuDtos;
import com.yourorg.hotel.rbac.domain.*;
import com.yourorg.hotel.rbac.infra.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class SubmenuService {

  private final SubmenuRepository submenus;
  private final MenuRepository menus;

  public SubmenuService(SubmenuRepository submenus, MenuRepository menus) {
    this.submenus = submenus; this.menus = menus;
  }

  @Transactional
  public SubmenuEntity create(SubmenuDtos.SubmenuCreateRequest req) {
    MenuEntity menu = menus.findByIdAndDeletedAtIsNull(req.menuId())
        .orElseThrow(() -> new AppException("MENU_NOT_FOUND","Menu not found.", HttpStatus.BAD_REQUEST));

    SubmenuEntity s = new SubmenuEntity();
    s.setMenu(menu);
    s.setKey(req.key());
    s.setLabel(req.label());
    s.setRoute(req.route());
    s.setSortOrder(req.sortOrder());
    return submenus.save(s);
  }

  @Transactional(readOnly = true)
  public List<SubmenuEntity> list() { return submenus.findAllActiveWithMenu(); }

  @Transactional
  public SubmenuEntity update(UUID id, SubmenuDtos.SubmenuUpdateRequest req) {
    SubmenuEntity s = submenus.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND","Submenu not found.", HttpStatus.NOT_FOUND));
    MenuEntity menu = menus.findByIdAndDeletedAtIsNull(req.menuId())
        .orElseThrow(() -> new AppException("MENU_NOT_FOUND","Menu not found.", HttpStatus.BAD_REQUEST));

    s.setMenu(menu);
    s.setKey(req.key());
    s.setLabel(req.label());
    s.setRoute(req.route());
    s.setSortOrder(req.sortOrder());
    return submenus.save(s);
  }

  @Transactional
  public void softDelete(UUID id) {
    SubmenuEntity s = submenus.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND","Submenu not found.", HttpStatus.NOT_FOUND));
    s.setDeletedAt(Instant.now());
    submenus.save(s);
  }
}

```

### rbac/application/PermissionService.java

```java
package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.PermissionDtos;
import com.yourorg.hotel.rbac.domain.PermissionEntity;
import com.yourorg.hotel.rbac.infra.PermissionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class PermissionService {

  private final PermissionRepository permissions;

  public PermissionService(PermissionRepository permissions) { this.permissions = permissions; }

  @Transactional
  public PermissionEntity create(PermissionDtos.PermissionCreateRequest req) {
    PermissionEntity p = new PermissionEntity();
    p.setResource(req.resource());
    p.setAction(req.action());
    p.setScope(req.scope());
    return permissions.save(p);
  }

  @Transactional(readOnly = true)
  public List<PermissionEntity> list() { return permissions.findAllActive(); }

  @Transactional
  public PermissionEntity update(UUID id, PermissionDtos.PermissionUpdateRequest req) {
    PermissionEntity p = permissions.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND","Permission not found.", HttpStatus.NOT_FOUND));
    p.setResource(req.resource());
    p.setAction(req.action());
    p.setScope(req.scope());
    return permissions.save(p);
  }

  @Transactional
  public void softDelete(UUID id) {
    PermissionEntity p = permissions.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND","Permission not found.", HttpStatus.NOT_FOUND));
    p.setDeletedAt(Instant.now());
    permissions.save(p);
  }
}

```

## Controllers (REST) — secured with rbac.ADMIN

### Users Controller

#### rbac/api/UserController.java

```java
package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.UserDtos;
import com.yourorg.hotel.rbac.application.RbacMappers;
import com.yourorg.hotel.rbac.application.UserService;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/rbac/users")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
public class UserController {

  private final UserService service;
  private final RbacMappers mapper;

  public UserController(UserService service, RbacMappers mapper) {
    this.service = service;
    this.mapper = mapper;
  }

  @PostMapping
  public UserDtos.UserResponse create(@Valid @RequestBody UserDtos.UserCreateRequest req) {
    return mapper.toUserResponse(service.create(req));
  }

  @GetMapping
  public List<UserDtos.UserResponse> list() {
    return mapper.toUserResponses(service.list());
  }

  @GetMapping("/{id}")
  public UserDtos.UserResponse get(@PathVariable UUID id) {
    return mapper.toUserResponse(service.get(id));
  }

  @PutMapping("/{id}")
  public UserDtos.UserResponse update(@PathVariable UUID id, @Valid @RequestBody UserDtos.UserUpdateRequest req) {
    return mapper.toUserResponse(service.update(id, req));
  }

  @PutMapping("/{id}/password")
  public void changePassword(@PathVariable UUID id, @Valid @RequestBody UserDtos.UserChangePasswordRequest req) {
    service.changePassword(id, req);
  }

  @PutMapping("/{id}/roles")
  public UserDtos.UserResponse replaceRoles(@PathVariable UUID id, @Valid @RequestBody UserDtos.UserReplaceRolesRequest req) {
    return mapper.toUserResponse(service.replaceRoles(id, req));
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) {
    service.softDelete(id);
  }
}
```

### Roles Controller

#### rbac/api/RoleController.java

```java
package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.RoleDtos;
import com.yourorg.hotel.rbac.application.RbacMappers;
import com.yourorg.hotel.rbac.application.RoleService;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/rbac/roles")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
public class RoleController {

  private final RoleService service;
  private final RbacMappers mapper;

  public RoleController(RoleService service, RbacMappers mapper) {
    this.service = service;
    this.mapper = mapper;
  }

  @PostMapping
  public RoleDtos.RoleResponse create(@Valid @RequestBody RoleDtos.RoleCreateRequest req) {
    return mapper.toRoleResponse(service.create(req));
  }

  @GetMapping
  public List<RoleDtos.RoleResponse> list() {
    return mapper.toRoleResponses(service.list());
  }

  @GetMapping("/{id}")
  public RoleDtos.RoleResponse get(@PathVariable UUID id) {
    return mapper.toRoleResponse(service.get(id));
  }

  @PutMapping("/{id}")
  public RoleDtos.RoleResponse update(@PathVariable UUID id, @Valid @RequestBody RoleDtos.RoleUpdateRequest req) {
    return mapper.toRoleResponse(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) {
    service.softDelete(id);
  }

  @GetMapping("/{id}/permissions")
  public List<UUID> getPermissions(@PathVariable UUID id) {
    return service.getPermissions(id).stream().map(p -> p.getId()).toList();
  }

  @PutMapping("/{id}/permissions")
  public void replacePermissions(@PathVariable UUID id, @Valid @RequestBody RoleDtos.ReplacePermissionsRequest req) {
    service.replacePermissions(id, req);
  }

  @GetMapping("/{id}/submenus")
  public List<UUID> getSubmenus(@PathVariable UUID id) {
    return service.getSubmenus(id).stream().map(s -> s.getId()).toList();
  }

  @PutMapping("/{id}/submenus")
  public void replaceSubmenus(@PathVariable UUID id, @Valid @RequestBody RoleDtos.ReplaceSubmenusRequest req) {
    service.replaceSubmenus(id, req);
  }
}

```

### Menus/Submenus/Permissions controllers

#### rbac/api/MenuController.java

```java
package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.MenuDtos;
import com.yourorg.hotel.rbac.application.MenuService;
import com.yourorg.hotel.rbac.application.RbacMappers;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/rbac/menus")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
public class MenuController {

  private final MenuService service;
  private final RbacMappers mapper;

  public MenuController(MenuService service, RbacMappers mapper) {
    this.service = service;
    this.mapper = mapper;
  }

  @PostMapping
  public MenuDtos.MenuResponse create(@Valid @RequestBody MenuDtos.MenuCreateRequest req) {
    return mapper.toMenuResponse(service.create(req));
  }

  @GetMapping
  public List<MenuDtos.MenuResponse> list() {
    return mapper.toMenuResponses(service.list());
  }

  @PutMapping("/{id}")
  public MenuDtos.MenuResponse update(@PathVariable UUID id, @Valid @RequestBody MenuDtos.MenuUpdateRequest req) {
    return mapper.toMenuResponse(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) { service.softDelete(id); }
}
```

#### rbac/api/SubmenuController.java

```java
package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.SubmenuDtos;
import com.yourorg.hotel.rbac.application.RbacMappers;
import com.yourorg.hotel.rbac.application.SubmenuService;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/rbac/submenus")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
public class SubmenuController {

  private final SubmenuService service;
  private final RbacMappers mapper;

  public SubmenuController(SubmenuService service, RbacMappers mapper) {
    this.service = service;
    this.mapper = mapper;
  }

  @PostMapping
  public SubmenuDtos.SubmenuResponse create(@Valid @RequestBody SubmenuDtos.SubmenuCreateRequest req) {
    return mapper.toSubmenuResponse(service.create(req));
  }

  @GetMapping
  public List<SubmenuDtos.SubmenuResponse> list() {
    return mapper.toSubmenuResponses(service.list());
  }

  @PutMapping("/{id}")
  public SubmenuDtos.SubmenuResponse update(@PathVariable UUID id, @Valid @RequestBody SubmenuDtos.SubmenuUpdateRequest req) {
    return mapper.toSubmenuResponse(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) { service.softDelete(id); }
}

```

#### rbac/api/PermissionController.java

```java
package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.PermissionDtos;
import com.yourorg.hotel.rbac.application.PermissionService;
import com.yourorg.hotel.rbac.application.RbacMappers;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/rbac/permissions")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
public class PermissionController {

  private final PermissionService service;
  private final RbacMappers mapper;

  public PermissionController(PermissionService service, RbacMappers mapper) {
    this.service = service;
    this.mapper = mapper;
  }

  @PostMapping
  public PermissionDtos.PermissionResponse create(@Valid @RequestBody PermissionDtos.PermissionCreateRequest req) {
    return mapper.toPermissionResponse(service.create(req));
  }

  @GetMapping
  public List<PermissionDtos.PermissionResponse> list() {
    return mapper.toPermissionResponses(service.list());
  }

  @PutMapping("/{id}")
  public PermissionDtos.PermissionResponse update(@PathVariable UUID id, @Valid @RequestBody PermissionDtos.PermissionUpdateRequest req) {
    return mapper.toPermissionResponse(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) { service.softDelete(id); }
}

```

## Picker APIs (Role Permission Picker + Role Submenu Picker)

### Permissions grouped by resource

#### rbac/api/PickerController.java

```java
package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.domain.PermissionEntity;
import com.yourorg.hotel.rbac.infra.PermissionRepository;
import com.yourorg.hotel.rbac.infra.MenuRepository;
import com.yourorg.hotel.rbac.infra.SubmenuRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/rbac/pickers")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
public class PickerController {

  private final PermissionRepository permissions;
  private final MenuRepository menus;
  private final SubmenuRepository submenus;

  public PickerController(PermissionRepository permissions, MenuRepository menus, SubmenuRepository submenus) {
    this.permissions = permissions;
    this.menus = menus;
    this.submenus = submenus;
  }

  @GetMapping("/permissions-grouped")
  public List<PermissionGroupDto> permissionsGrouped() {
    List<PermissionEntity> list = permissions.findAllActive();

    Map<String, List<PermissionDto>> map = new LinkedHashMap<>();
    for (var p : list) {
      map.computeIfAbsent(p.getResource(), k -> new ArrayList<>())
          .add(new PermissionDto(p.getId(), p.getAction(), p.getScope(), p.key()));
    }

    // stable sort by action
    map.values().forEach(v -> v.sort(Comparator.comparing(PermissionDto::action)));

    List<PermissionGroupDto> out = new ArrayList<>();
    for (var e : map.entrySet()) {
      out.add(new PermissionGroupDto(e.getKey(), e.getValue()));
    }
    return out;
  }

  @GetMapping("/menu-tree")
  public List<MenuTreeDto> menuTree() {
    var menuList = menus.findAllActive();
    var submenuList = submenus.findAllActiveWithMenu();

    Map<UUID, MenuTreeDto> menuMap = new LinkedHashMap<>();
    for (var m : menuList) {
      menuMap.put(m.getId(), new MenuTreeDto(m.getId(), m.getKey(), m.getLabel(), m.getSortOrder(), new ArrayList<>()));
    }

    for (var s : submenuList) {
      var m = s.getMenu();
      var node = menuMap.get(m.getId());
      if (node == null) continue;
      node.submenus().add(new SubmenuTreeDto(s.getId(), s.getKey(), s.getLabel(), s.getRoute(), s.getSortOrder()));
    }

    var out = new ArrayList<>(menuMap.values());
    out.sort(Comparator.comparingInt(MenuTreeDto::sortOrder));
    out.forEach(m -> m.submenus().sort(Comparator.comparingInt(SubmenuTreeDto::sortOrder)));
    return out;
  }

  public record PermissionGroupDto(String resource, List<PermissionDto> permissions) {}
  public record PermissionDto(UUID id, String action, String scope, String key) {}

  public record MenuTreeDto(UUID id, String key, String label, int sortOrder, List<SubmenuTreeDto> submenus) {}
  public record SubmenuTreeDto(UUID id, String key, String label, String route, int sortOrder) {}
}
```

##### ✅ This is perfect for building:

- Role Permission Picker grouped by resource
- Role Submenu Picker as a menu tree with submenus

## Required entity column mappings (important!)

- If your entities don’t have @Column(name="created_at") etc., Hibernate will look for camelCase columns.
So update your entities (UserEntity, RoleEntity, MenuEntity, SubmenuEntity, PermissionEntity) to map DB column names.

### Example: in UserEntity:

```java
@Column(name="password_hash", nullable=false)
private String passwordHash;

@Column(name="created_at", nullable=false)
private Instant createdAt;

@Column(name="deleted_at")
private Instant deletedAt;
```

### Recommendation: Put these mappings in BaseEntity:

```java
@Column(name="created_at", nullable=false, updatable=false)
private Instant createdAt = Instant.now();

@Column(name="updated_at", nullable=false)
private Instant updatedAt = Instant.now();

@Column(name="deleted_at")
private Instant deletedAt;
```

- And then map specific fields per entity.

## Security notes (production correctness)

### ✅ Stateless JWT means:

- No server session storage
- Token revocation requires extra design (refresh token rotation or token version) 

### Recommended next improvement:

- Add rbac_users.token_version and embed it in JWT. If user is disabled or token_version increments, tokens become invalid (requires DB check or caching). We can do that next.


