package com.yourorg.hotel.customer.application;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.auth.google")
public class GoogleOAuthProperties {
  private String clientId;
  private String clientSecret;
  private String redirectUri;
  private String storefrontBaseUrl;

  public String getClientId() {
    return clientId;
  }

  public void setClientId(String clientId) {
    this.clientId = clientId;
  }

  public String getClientSecret() {
    return clientSecret;
  }

  public void setClientSecret(String clientSecret) {
    this.clientSecret = clientSecret;
  }

  public String getRedirectUri() {
    return redirectUri;
  }

  public void setRedirectUri(String redirectUri) {
    this.redirectUri = redirectUri;
  }

  public String getStorefrontBaseUrl() {
    return storefrontBaseUrl;
  }

  public void setStorefrontBaseUrl(String storefrontBaseUrl) {
    this.storefrontBaseUrl = storefrontBaseUrl;
  }
}
