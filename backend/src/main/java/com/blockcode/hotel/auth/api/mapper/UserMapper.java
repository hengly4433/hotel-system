package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.UserResponse;
import com.blockcode.hotel.auth.domain.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
  @Mapping(target = "roleIds", ignore = true)
  UserResponse toResponse(UserEntity entity);
}
