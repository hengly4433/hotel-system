package com.blockcode.hotel.customer.api;

import com.blockcode.hotel.customer.api.dto.CustomerAuthResponse;
import com.blockcode.hotel.customer.api.dto.CustomerGoogleAuthRequest;
import com.blockcode.hotel.customer.api.dto.CustomerLoginRequest;
import com.blockcode.hotel.customer.api.dto.CustomerProfileResponse;
import com.blockcode.hotel.customer.api.dto.CustomerRegisterRequest;
import com.blockcode.hotel.customer.application.CustomerAuthService;
import com.blockcode.hotel.customer.application.GoogleOAuthProperties;
import com.blockcode.hotel.customer.application.GoogleOAuthService;
import com.blockcode.hotel.customer.application.GoogleOAuthStateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/auth")
public class CustomerAuthController {
  private final CustomerAuthService authService;
  private final GoogleOAuthService googleOAuthService;
  private final GoogleOAuthStateService googleOAuthStateService;
  private final GoogleOAuthProperties googleOAuthProperties;

  public CustomerAuthController(
      CustomerAuthService authService,
      GoogleOAuthService googleOAuthService,
      GoogleOAuthStateService googleOAuthStateService,
      GoogleOAuthProperties googleOAuthProperties
  ) {
    this.authService = authService;
    this.googleOAuthService = googleOAuthService;
    this.googleOAuthStateService = googleOAuthStateService;
    this.googleOAuthProperties = googleOAuthProperties;
  }

  @PostMapping("/register")
  public CustomerAuthResponse register(@Valid @RequestBody CustomerRegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/login")
  public CustomerAuthResponse login(@Valid @RequestBody CustomerLoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/google")
  public CustomerAuthResponse loginWithGoogle(@Valid @RequestBody CustomerGoogleAuthRequest request) {
    return authService.loginWithGoogle(request);
  }

  @GetMapping("/google/start")
  public ResponseEntity<Void> startGoogleLogin(@RequestParam(value = "redirect", required = false) String redirect) {
    String sanitizedRedirect = sanitizeRedirect(redirect);
    String state = googleOAuthStateService.createState(sanitizedRedirect);

    if (googleOAuthProperties.getClientId() == null || googleOAuthProperties.getClientId().isBlank()
        || googleOAuthProperties.getRedirectUri() == null || googleOAuthProperties.getRedirectUri().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    String url = UriComponentsBuilder
        .fromHttpUrl("https://accounts.google.com/o/oauth2/v2/auth")
        .queryParam("client_id", googleOAuthProperties.getClientId())
        .queryParam("redirect_uri", googleOAuthProperties.getRedirectUri())
        .queryParam("response_type", "code")
        .queryParam("scope", "openid email profile")
        .queryParam("prompt", "select_account")
        .queryParam("state", state)
        .encode(StandardCharsets.UTF_8)
        .build()
        .toUriString();

    return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
  }

  @GetMapping("/google/callback")
  public ResponseEntity<Void> handleGoogleCallback(
      @RequestParam("code") String code,
      @RequestParam("state") String state,
      @RequestParam(value = "error", required = false) String error
  ) {
    String redirectPath = sanitizeRedirect(googleOAuthStateService.parseRedirect(state));

    String storefrontBase = googleOAuthProperties.getStorefrontBaseUrl();
    if (storefrontBase == null || storefrontBase.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    if (error != null && !error.isBlank()) {
      String errorUrl = UriComponentsBuilder
          .fromHttpUrl(storefrontBase)
          .path("/auth/google/callback")
          .queryParam("error", error)
          .queryParam("redirect", redirectPath)
          .build()
          .toUriString();
      return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(errorUrl)).build();
    }

    String idToken = googleOAuthService.exchangeCodeForIdToken(code);
    CustomerAuthResponse authResponse = authService.loginWithGoogle(new CustomerGoogleAuthRequest(idToken));

    String callbackUrl = UriComponentsBuilder
        .fromHttpUrl(storefrontBase)
        .path("/auth/google/callback")
        .queryParam("token", authResponse.accessToken())
        .queryParam("redirect", redirectPath)
        .build()
        .toUriString();

    return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(callbackUrl)).build();
  }

  @GetMapping("/me")
  @PreAuthorize("hasAuthority('customer.BOOK')")
  public CustomerProfileResponse me(Authentication authentication) {
    UUID customerId = UUID.fromString(authentication.getName());
    return authService.me(customerId);
  }

  private String sanitizeRedirect(String redirect) {
    if (redirect == null || redirect.isBlank()) {
      return "/";
    }
    if (redirect.startsWith("/") && !redirect.startsWith("//")) {
      return redirect;
    }
    return "/";
  }
}
