package com.yourorg.hotel.rbac.api.mapper;

import com.yourorg.hotel.rbac.api.dto.PermissionResponse;
import com.yourorg.hotel.rbac.domain.RbacPermissionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
  PermissionResponse toResponse(RbacPermissionEntity entity);
}
