package com.yourorg.hotel.customer.application;

import com.yourorg.hotel.auth.security.JwtProperties;
import com.yourorg.hotel.common.exception.AppException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class GoogleOAuthStateService {
  private static final Duration STATE_TTL = Duration.ofMinutes(10);

  private final SecretKey secretKey;

  public GoogleOAuthStateService(JwtProperties jwtProperties) {
    this.secretKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
  }

  public String createState(String redirect) {
    Instant now = Instant.now();
    Instant expiresAt = now.plus(STATE_TTL);
    return Jwts.builder()
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiresAt))
        .claims(Map.of("redirect", redirect))
        .signWith(secretKey)
        .compact();
  }

  public String parseRedirect(String stateToken) {
    try {
      Claims claims = Jwts.parser()
          .verifyWith(secretKey)
          .build()
          .parseSignedClaims(stateToken)
          .getPayload();
      Object redirect = claims.get("redirect");
      return redirect == null ? "/" : redirect.toString();
    } catch (JwtException ex) {
      throw new AppException("INVALID_STATE", "Invalid OAuth state", HttpStatus.BAD_REQUEST);
    }
  }
}
