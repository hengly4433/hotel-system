package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.PermissionResponse;
import com.blockcode.hotel.auth.domain.PermissionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
  PermissionResponse toResponse(PermissionEntity entity);
}
