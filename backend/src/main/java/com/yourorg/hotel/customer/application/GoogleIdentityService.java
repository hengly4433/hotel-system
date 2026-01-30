package com.yourorg.hotel.customer.application;

import com.yourorg.hotel.common.exception.AppException;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Service
public class GoogleIdentityService {
  private static final Set<String> VALID_ISSUERS = Set.of(
      "accounts.google.com",
      "https://accounts.google.com"
  );

  private final RestTemplate restTemplate;
  private final GoogleOAuthProperties properties;

  public GoogleIdentityService(
      RestTemplateBuilder restTemplateBuilder,
      GoogleOAuthProperties properties
  ) {
    this.restTemplate = restTemplateBuilder.build();
    this.properties = properties;
  }

  public GoogleIdentityPayload verify(String idToken) {
    if (properties.getClientId() == null || properties.getClientId().isBlank()) {
      throw new AppException("GOOGLE_NOT_CONFIGURED", "Google sign-in is not configured", HttpStatus.BAD_REQUEST);
    }

    String url = "https://oauth2.googleapis.com/tokeninfo?id_token="
        + UriUtils.encode(idToken, StandardCharsets.UTF_8);
    Map<String, Object> response;
    try {
      response = restTemplate.getForObject(url, Map.class);
    } catch (HttpClientErrorException ex) {
      throw new AppException("INVALID_GOOGLE_TOKEN", "Invalid Google token", HttpStatus.UNAUTHORIZED);
    } catch (Exception ex) {
      throw new AppException("GOOGLE_AUTH_FAILED", "Unable to verify Google token", HttpStatus.BAD_REQUEST);
    }

    if (response == null) {
      throw new AppException("INVALID_GOOGLE_TOKEN", "Invalid Google token", HttpStatus.UNAUTHORIZED);
    }

    String audience = readString(response, "aud");
    if (audience == null || !audience.equals(properties.getClientId())) {
      throw new AppException("INVALID_GOOGLE_TOKEN", "Google token audience mismatch", HttpStatus.UNAUTHORIZED);
    }

    String issuer = readString(response, "iss");
    if (issuer == null || !VALID_ISSUERS.contains(issuer)) {
      throw new AppException("INVALID_GOOGLE_TOKEN", "Google token issuer mismatch", HttpStatus.UNAUTHORIZED);
    }

    boolean emailVerified = readBoolean(response, "email_verified");
    if (!emailVerified) {
      throw new AppException("EMAIL_NOT_VERIFIED", "Google account email not verified", HttpStatus.BAD_REQUEST);
    }

    long exp = readLong(response, "exp");
    if (exp > 0 && Instant.now().getEpochSecond() >= exp) {
      throw new AppException("GOOGLE_TOKEN_EXPIRED", "Google token expired", HttpStatus.UNAUTHORIZED);
    }

    String email = readString(response, "email");
    String subject = readString(response, "sub");
    if (email == null || subject == null) {
      throw new AppException("INVALID_GOOGLE_TOKEN", "Google token missing profile data", HttpStatus.UNAUTHORIZED);
    }

    return new GoogleIdentityPayload(
        subject,
        email,
        emailVerified,
        readString(response, "given_name"),
        readString(response, "family_name"),
        readString(response, "name"),
        readString(response, "picture")
    );
  }

  private static String readString(Map<String, Object> response, String key) {
    Object value = response.get(key);
    return value == null ? null : value.toString();
  }

  private static boolean readBoolean(Map<String, Object> response, String key) {
    Object value = response.get(key);
    if (value == null) {
      return false;
    }
    if (value instanceof Boolean bool) {
      return bool;
    }
    return "true".equalsIgnoreCase(value.toString());
  }

  private static long readLong(Map<String, Object> response, String key) {
    Object value = response.get(key);
    if (value == null) {
      return 0L;
    }
    try {
      return Long.parseLong(value.toString());
    } catch (NumberFormatException ex) {
      return 0L;
    }
  }
}
