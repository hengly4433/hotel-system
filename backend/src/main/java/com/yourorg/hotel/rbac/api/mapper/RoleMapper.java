package com.yourorg.hotel.rbac.api.mapper;

import com.yourorg.hotel.rbac.api.dto.RoleResponse;
import com.yourorg.hotel.rbac.domain.RbacRoleEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
  RoleResponse toResponse(RbacRoleEntity entity);
}
