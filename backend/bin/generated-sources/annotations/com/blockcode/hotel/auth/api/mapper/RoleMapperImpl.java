package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.RoleResponse;
import com.blockcode.hotel.auth.domain.RoleEntity;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-08T22:41:46+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260128-0750, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class RoleMapperImpl implements RoleMapper {

    @Override
    public RoleResponse toResponse(RoleEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        UUID propertyId = null;

        id = entity.getId();
        name = entity.getName();
        propertyId = entity.getPropertyId();

        RoleResponse roleResponse = new RoleResponse( id, name, propertyId );

        return roleResponse;
    }
}
