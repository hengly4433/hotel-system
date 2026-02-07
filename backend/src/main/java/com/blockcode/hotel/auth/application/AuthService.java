package com.blockcode.hotel.auth.application;

import com.blockcode.hotel.auth.dto.LoginRequest;
import com.blockcode.hotel.auth.dto.LoginResponse;
import com.blockcode.hotel.auth.security.JwtService;
import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.auth.domain.UserEntity;
import com.blockcode.hotel.auth.domain.UserStatus;
import com.blockcode.hotel.auth.infra.AuthorizationRepository;
import com.blockcode.hotel.auth.infra.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class AuthService {
  private final UserRepository userRepository;
  private final AuthorizationRepository authorizationRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository,
      AuthorizationRepository authorizationRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService
  ) {
    this.userRepository = userRepository;
    this.authorizationRepository = authorizationRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public LoginResponse login(LoginRequest request) {
    UserEntity user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.email())
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
