package com.blockcode.hotel.auth.api;

import com.blockcode.hotel.auth.api.dto.UserCreateRequest;
import com.blockcode.hotel.auth.api.dto.UserPasswordRequest;
import com.blockcode.hotel.auth.api.dto.UserResponse;
import com.blockcode.hotel.auth.api.dto.UserRolesReplaceRequest;
import com.blockcode.hotel.auth.api.dto.UserUpdateRequest;
import com.blockcode.hotel.auth.application.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rbac/users")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
@Validated
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping
  public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
    return userService.create(request);
  }

  @GetMapping
  public List<UserResponse> list() {
    return userService.list();
  }

  @GetMapping("/{id}")
  public UserResponse get(@PathVariable UUID id) {
    return userService.get(id);
  }

  @PutMapping("/{id}")
  public UserResponse update(@PathVariable UUID id, @Valid @RequestBody UserUpdateRequest request) {
    return userService.update(id, request);
  }

  @PutMapping("/{id}/password")
  public ResponseEntity<Void> updatePassword(@PathVariable UUID id, @Valid @RequestBody UserPasswordRequest request) {
    userService.updatePassword(id, request);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{id}/roles")
  public List<UUID> replaceRoles(@PathVariable UUID id, @RequestBody UserRolesReplaceRequest request) {
    return userService.replaceRoles(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    userService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
