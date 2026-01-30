package com.yourorg.hotel.rbac.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rbac_user_roles")
public class RbacUserRoleEntity {
  @EmbeddedId
  private RbacUserRoleId id;

  public RbacUserRoleEntity() {
  }

  public RbacUserRoleEntity(RbacUserRoleId id) {
    this.id = id;
  }

  public RbacUserRoleId getId() {
    return id;
  }

  public void setId(RbacUserRoleId id) {
    this.id = id;
  }
}
