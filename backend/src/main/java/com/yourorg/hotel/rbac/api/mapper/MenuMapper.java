package com.yourorg.hotel.rbac.api.mapper;

import com.yourorg.hotel.rbac.api.dto.MenuResponse;
import com.yourorg.hotel.rbac.domain.RbacMenuEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MenuMapper {
  MenuResponse toResponse(RbacMenuEntity entity);
}
