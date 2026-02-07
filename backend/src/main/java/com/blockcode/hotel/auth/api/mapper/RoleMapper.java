package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.RoleResponse;
import com.blockcode.hotel.auth.domain.RoleEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
  RoleResponse toResponse(RoleEntity entity);
}
