package com.yourorg.hotel.rbac.api.mapper;

import com.yourorg.hotel.rbac.api.dto.UserResponse;
import com.yourorg.hotel.rbac.domain.RbacUserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
  @Mapping(target = "roleIds", ignore = true)
  UserResponse toResponse(RbacUserEntity entity);
}
