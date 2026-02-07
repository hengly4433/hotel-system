package com.blockcode.hotel.auth.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "role_permissions")
public class RolePermissionEntity {
  @EmbeddedId
  private RolePermissionId id;

  public RolePermissionEntity() {
  }

  public RolePermissionEntity(RolePermissionId id) {
    this.id = id;
  }

  public RolePermissionId getId() {
    return id;
  }

  public void setId(RolePermissionId id) {
    this.id = id;
  }
}
