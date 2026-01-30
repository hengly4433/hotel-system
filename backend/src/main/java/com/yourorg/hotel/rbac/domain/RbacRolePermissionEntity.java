package com.yourorg.hotel.rbac.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rbac_role_permissions")
public class RbacRolePermissionEntity {
  @EmbeddedId
  private RbacRolePermissionId id;

  public RbacRolePermissionEntity() {
  }

  public RbacRolePermissionEntity(RbacRolePermissionId id) {
    this.id = id;
  }

  public RbacRolePermissionId getId() {
    return id;
  }

  public void setId(RbacRolePermissionId id) {
    this.id = id;
  }
}
