package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.SubmenuResponse;
import com.blockcode.hotel.auth.domain.SubmenuEntity;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-08T22:41:47+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260128-0750, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class SubmenuMapperImpl implements SubmenuMapper {

    @Override
    public SubmenuResponse toResponse(SubmenuEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        UUID menuId = null;
        String key = null;
        String label = null;
        String route = null;
        Integer sortOrder = null;

        id = entity.getId();
        menuId = entity.getMenuId();
        key = entity.getKey();
        label = entity.getLabel();
        route = entity.getRoute();
        sortOrder = entity.getSortOrder();

        SubmenuResponse submenuResponse = new SubmenuResponse( id, menuId, key, label, route, sortOrder );

        return submenuResponse;
    }
}
