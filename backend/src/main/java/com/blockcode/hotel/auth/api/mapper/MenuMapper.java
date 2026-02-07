package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.MenuResponse;
import com.blockcode.hotel.auth.domain.MenuEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MenuMapper {
  MenuResponse toResponse(MenuEntity entity);
}
