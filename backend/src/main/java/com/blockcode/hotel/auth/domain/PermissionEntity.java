package com.blockcode.hotel.auth.domain;

import com.blockcode.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "permissions")
public class PermissionEntity extends AuditableEntity {
  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "resource", nullable = false)
  private String resource;

  @Column(name = "action", nullable = false)
  private String action;

  @Column(name = "scope")
  private String scope;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getResource() {
    return resource;
  }

  public void setResource(String resource) {
    this.resource = resource;
  }

  public String getAction() {
    return action;
  }

  public void setAction(String action) {
    this.action = action;
  }

  public String getScope() {
    return scope;
  }

  public void setScope(String scope) {
    this.scope = scope;
  }
}
