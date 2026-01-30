package com.yourorg.hotel.customer.domain;

import com.yourorg.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "customer_accounts")
public class CustomerEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "person_id", nullable = false)
  private UUID personId;

  @Column(name = "guest_id", nullable = false)
  private UUID guestId;

  @Column(name = "email", nullable = false, columnDefinition = "citext")
  private String email;

  @Column(name = "password_hash")
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "auth_provider", nullable = false)
  private CustomerAuthProvider authProvider = CustomerAuthProvider.LOCAL;

  @Column(name = "provider_subject")
  private String providerSubject;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private CustomerStatus status = CustomerStatus.ACTIVE;

  @Column(name = "last_login_at")
  private Instant lastLoginAt;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getPersonId() {
    return personId;
  }

  public void setPersonId(UUID personId) {
    this.personId = personId;
  }

  public UUID getGuestId() {
    return guestId;
  }

  public void setGuestId(UUID guestId) {
    this.guestId = guestId;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public CustomerAuthProvider getAuthProvider() {
    return authProvider;
  }

  public void setAuthProvider(CustomerAuthProvider authProvider) {
    this.authProvider = authProvider;
  }

  public String getProviderSubject() {
    return providerSubject;
  }

  public void setProviderSubject(String providerSubject) {
    this.providerSubject = providerSubject;
  }

  public CustomerStatus getStatus() {
    return status;
  }

  public void setStatus(CustomerStatus status) {
    this.status = status;
  }

  public Instant getLastLoginAt() {
    return lastLoginAt;
  }

  public void setLastLoginAt(Instant lastLoginAt) {
    this.lastLoginAt = lastLoginAt;
  }
}
