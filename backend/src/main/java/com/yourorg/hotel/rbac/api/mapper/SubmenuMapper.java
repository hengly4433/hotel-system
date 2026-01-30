package com.yourorg.hotel.rbac.api.mapper;

import com.yourorg.hotel.rbac.api.dto.SubmenuResponse;
import com.yourorg.hotel.rbac.domain.RbacSubmenuEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubmenuMapper {
  SubmenuResponse toResponse(RbacSubmenuEntity entity);
}
