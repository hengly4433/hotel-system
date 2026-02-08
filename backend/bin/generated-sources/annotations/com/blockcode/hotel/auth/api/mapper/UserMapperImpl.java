package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.UserResponse;
import com.blockcode.hotel.auth.domain.UserEntity;
import com.blockcode.hotel.auth.domain.UserStatus;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-08T22:41:47+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260128-0750, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(UserEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        String email = null;
        UserStatus status = null;
        UUID propertyId = null;

        id = entity.getId();
        email = entity.getEmail();
        status = entity.getStatus();
        propertyId = entity.getPropertyId();

        List<UUID> roleIds = null;

        UserResponse userResponse = new UserResponse( id, email, status, propertyId, roleIds );

        return userResponse;
    }
}
