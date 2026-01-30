package com.yourorg.hotel.rbac.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rbac_role_submenus")
public class RbacRoleSubmenuEntity {
  @EmbeddedId
  private RbacRoleSubmenuId id;

  public RbacRoleSubmenuEntity() {
  }

  public RbacRoleSubmenuEntity(RbacRoleSubmenuId id) {
    this.id = id;
  }

  public RbacRoleSubmenuId getId() {
    return id;
  }

  public void setId(RbacRoleSubmenuId id) {
    this.id = id;
  }
}
