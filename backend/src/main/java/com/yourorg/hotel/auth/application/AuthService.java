package com.yourorg.hotel.auth.application;

import com.yourorg.hotel.auth.dto.LoginRequest;
import com.yourorg.hotel.auth.dto.LoginResponse;
import com.yourorg.hotel.auth.security.JwtService;
import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.domain.RbacUserEntity;
import com.yourorg.hotel.rbac.domain.UserStatus;
import com.yourorg.hotel.rbac.infra.RbacAuthorizationRepository;
import com.yourorg.hotel.rbac.infra.RbacUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class AuthService {
  private final RbacUserRepository userRepository;
  private final RbacAuthorizationRepository authorizationRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      RbacUserRepository userRepository,
      RbacAuthorizationRepository authorizationRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService
  ) {
    this.userRepository = userRepository;
    this.authorizationRepository = authorizationRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public LoginResponse login(LoginRequest request) {
    RbacUserEntity user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.email())
        .orElseThrow(() -> new AppException("INVALID_CREDENTIALS", "Invalid credentials", HttpStatus.UNAUTHORIZED));

    if (user.getStatus() != UserStatus.ACTIVE) {
      throw new AppException("USER_SUSPENDED", "User is suspended", HttpStatus.FORBIDDEN);
    }

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new AppException("INVALID_CREDENTIALS", "Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    List<String> authorities = authorizationRepository.findPermissionCodesByUserId(user.getId());
    String token = jwtService.generateToken(user.getId(), user.getEmail(), authorities);

    user.setLastLoginAt(Instant.now());
    userRepository.save(user);

    return new LoginResponse(token, "Bearer", jwtService.getAccessTokenTtlSeconds());
  }
}
