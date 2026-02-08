package com.blockcode.hotel.auth.api.mapper;

import com.blockcode.hotel.auth.api.dto.MenuResponse;
import com.blockcode.hotel.auth.domain.MenuEntity;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-08T22:41:46+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260128-0750, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class MenuMapperImpl implements MenuMapper {

    @Override
    public MenuResponse toResponse(MenuEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        String key = null;
        String label = null;
        Integer sortOrder = null;

        id = entity.getId();
        key = entity.getKey();
        label = entity.getLabel();
        sortOrder = entity.getSortOrder();

        MenuResponse menuResponse = new MenuResponse( id, key, label, sortOrder );

        return menuResponse;
    }
}
