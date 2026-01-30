package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.NavigationMenuResponse;
import com.yourorg.hotel.rbac.application.RbacNavigationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {
  private final RbacNavigationService navigationService;

  public MeController(RbacNavigationService navigationService) {
    this.navigationService = navigationService;
  }

  @GetMapping("/navigation")
  @PreAuthorize("isAuthenticated()")
  public List<NavigationMenuResponse> navigation() {
    return navigationService.getCurrentNavigation();
  }
}
