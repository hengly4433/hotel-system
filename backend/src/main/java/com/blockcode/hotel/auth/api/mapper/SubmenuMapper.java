package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.SubmenuResponse;
import com.blockcode.hotel.auth.domain.SubmenuEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubmenuMapper {
  SubmenuResponse toResponse(SubmenuEntity entity);
}
