package com.blockcode.hotel.customer.application;

import com.blockcode.hotel.common.exception.AppException;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GoogleOAuthService {
  private final RestTemplate restTemplate;
  private final GoogleOAuthProperties properties;

  public GoogleOAuthService(RestTemplateBuilder restTemplateBuilder, GoogleOAuthProperties properties) {
    this.restTemplate = restTemplateBuilder.build();
    this.properties = properties;
  }

  public String exchangeCodeForIdToken(String code) {
    if (properties.getClientId() == null || properties.getClientId().isBlank()
        || properties.getClientSecret() == null || properties.getClientSecret().isBlank()
        || properties.getRedirectUri() == null || properties.getRedirectUri().isBlank()) {
      throw new AppException("GOOGLE_NOT_CONFIGURED", "Google OAuth is not configured", HttpStatus.BAD_REQUEST);
    }

    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("code", code);
    form.add("client_id", properties.getClientId());
    form.add("client_secret", properties.getClientSecret());
    form.add("redirect_uri", properties.getRedirectUri());
    form.add("grant_type", "authorization_code");

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(form, headers);

    try {
      ResponseEntity<Map> response = restTemplate.postForEntity(
          "https://oauth2.googleapis.com/token",
          entity,
          Map.class
      );
      Map<String, Object> body = response.getBody();
      if (body == null) {
        throw new AppException("GOOGLE_AUTH_FAILED", "Google token response missing", HttpStatus.BAD_REQUEST);
      }
      Object idToken = body.get("id_token");
      if (idToken == null || idToken.toString().isBlank()) {
        throw new AppException("GOOGLE_AUTH_FAILED", "Google token response missing id_token", HttpStatus.BAD_REQUEST);
      }
      return idToken.toString();
    } catch (HttpClientErrorException ex) {
      throw new AppException("GOOGLE_AUTH_FAILED", "Unable to exchange Google code", HttpStatus.BAD_REQUEST);
    }
  }
}
