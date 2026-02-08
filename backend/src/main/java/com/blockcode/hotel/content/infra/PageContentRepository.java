package com.blockcode.hotel.content.infra;

import com.blockcode.hotel.content.domain.PageContentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PageContentRepository extends JpaRepository<PageContentEntity, UUID> {
    Optional<PageContentEntity> findBySectionKey(String sectionKey);
}
