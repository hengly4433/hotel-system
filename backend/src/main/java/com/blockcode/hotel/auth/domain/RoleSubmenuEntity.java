package com.blockcode.hotel.auth.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "role_submenus")
public class RoleSubmenuEntity {
  @EmbeddedId
  private RoleSubmenuId id;

  public RoleSubmenuEntity() {
  }

  public RoleSubmenuEntity(RoleSubmenuId id) {
    this.id = id;
  }

  public RoleSubmenuId getId() {
    return id;
  }

  public void setId(RoleSubmenuId id) {
    this.id = id;
  }
}
