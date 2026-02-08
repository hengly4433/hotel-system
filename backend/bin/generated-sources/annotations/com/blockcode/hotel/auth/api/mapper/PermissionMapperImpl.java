package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.PermissionResponse;
import com.blockcode.hotel.auth.domain.PermissionEntity;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-08T22:41:47+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260128-0750, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class PermissionMapperImpl implements PermissionMapper {

    @Override
    public PermissionResponse toResponse(PermissionEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        String resource = null;
        String action = null;
        String scope = null;

        id = entity.getId();
        resource = entity.getResource();
        action = entity.getAction();
        scope = entity.getScope();

        PermissionResponse permissionResponse = new PermissionResponse( id, resource, action, scope );

        return permissionResponse;
    }
}
