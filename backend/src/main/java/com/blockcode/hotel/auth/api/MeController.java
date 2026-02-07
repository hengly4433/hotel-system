package com.blockcode.hotel.auth.api;

import com.blockcode.hotel.auth.api.dto.NavigationMenuResponse;
import com.blockcode.hotel.auth.application.NavigationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {
  private final NavigationService navigationService;

  public MeController(NavigationService navigationService) {
    this.navigationService = navigationService;
  }

  @GetMapping("/navigation")
  @PreAuthorize("isAuthenticated()")
  public List<NavigationMenuResponse> navigation() {
    return navigationService.getCurrentNavigation();
  }
}
