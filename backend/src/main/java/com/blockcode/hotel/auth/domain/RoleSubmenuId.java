package com.blockcode.hotel.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class RoleSubmenuId implements Serializable {
  @Column(name = "role_id", columnDefinition = "uuid")
  private UUID roleId;

  @Column(name = "submenu_id", columnDefinition = "uuid")
  private UUID submenuId;

  public RoleSubmenuId() {
  }

  public RoleSubmenuId(UUID roleId, UUID submenuId) {
    this.roleId = roleId;
    this.submenuId = submenuId;
  }

  public UUID getRoleId() {
    return roleId;
  }

  public void setRoleId(UUID roleId) {
    this.roleId = roleId;
  }

  public UUID getSubmenuId() {
    return submenuId;
  }

  public void setSubmenuId(UUID submenuId) {
    this.submenuId = submenuId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    RoleSubmenuId that = (RoleSubmenuId) o;
    return Objects.equals(roleId, that.roleId) && Objects.equals(submenuId, that.submenuId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(roleId, submenuId);
  }
}
