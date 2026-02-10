package com.blockcode.hotel.auth.api;

import com.blockcode.hotel.auth.api.dto.NavigationMenuResponse;
import com.blockcode.hotel.auth.api.dto.UserPasswordRequest;
import com.blockcode.hotel.auth.api.dto.UserResponse;
import com.blockcode.hotel.auth.api.dto.UserUpdateRequest;
import com.blockcode.hotel.auth.application.NavigationService;
import com.blockcode.hotel.auth.application.UserService;
import com.blockcode.hotel.common.security.CurrentUserProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {
  private final NavigationService navigationService;
  private final UserService userService;
  private final CurrentUserProvider currentUserProvider;

  public MeController(
      NavigationService navigationService,
      UserService userService,
      CurrentUserProvider currentUserProvider
  ) {
    this.navigationService = navigationService;
    this.userService = userService;
    this.currentUserProvider = currentUserProvider;
  }

  @GetMapping("/navigation")
  @PreAuthorize("isAuthenticated()")
  public List<NavigationMenuResponse> navigation() {
    return navigationService.getCurrentNavigation();
  }

  @GetMapping("/profile")
  @PreAuthorize("isAuthenticated()")
  public UserResponse getProfile() {
    UUID userId = currentUserProvider.getRequiredUserId();
    return userService.get(userId);
  }

  @PutMapping("/profile")
  @PreAuthorize("isAuthenticated()")
  public UserResponse updateProfile(@Valid @RequestBody UserUpdateRequest request) {
    UUID userId = currentUserProvider.getRequiredUserId();
    return userService.update(userId, request);
  }

  @PutMapping("/profile/password")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Void> updatePassword(@Valid @RequestBody UserPasswordRequest request) {
    UUID userId = currentUserProvider.getRequiredUserId();
    userService.updatePassword(userId, request);
    return ResponseEntity.noContent().build();
  }
}
