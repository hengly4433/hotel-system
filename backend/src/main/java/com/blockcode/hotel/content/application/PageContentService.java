package com.blockcode.hotel.content.application;

import com.blockcode.hotel.content.api.dto.PageContentRequest;
import com.blockcode.hotel.content.api.dto.PageContentResponse;
import com.blockcode.hotel.content.domain.PageContentEntity;
import com.blockcode.hotel.content.infra.PageContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PageContentService {
    private final PageContentRepository pageContentRepository;

    public PageContentService(PageContentRepository pageContentRepository) {
        this.pageContentRepository = pageContentRepository;
    }

    public PageContentResponse create(PageContentRequest request) {
        if (pageContentRepository.findBySectionKey(request.sectionKey()).isPresent()) {
            throw new IllegalArgumentException("Section content already exists for key: " + request.sectionKey());
        }
        PageContentEntity entity = new PageContentEntity();
        updateEntity(entity, request);
        PageContentEntity saved = pageContentRepository.save(entity);
        return toResponse(saved);
    }

    public PageContentResponse update(UUID id, PageContentRequest request) {
        PageContentEntity entity = pageContentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Page content not found"));

        // Check key uniqueness if changed
        if (!entity.getSectionKey().equals(request.sectionKey()) &&
                pageContentRepository.findBySectionKey(request.sectionKey()).isPresent()) {
            throw new IllegalArgumentException("Section key already in use");
        }

        updateEntity(entity, request);
        return toResponse(pageContentRepository.save(entity));
    }

    public PageContentResponse get(UUID id) {
        return pageContentRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Page content not found"));
    }

    public PageContentResponse getByKey(String key) {
        return pageContentRepository.findBySectionKey(key)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Content not found for key: " + key));
    }

    public List<PageContentResponse> list() {
        return pageContentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private void updateEntity(PageContentEntity entity, PageContentRequest request) {
        entity.setSectionKey(request.sectionKey());
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setImageUrl(request.imageUrl());
        entity.setActive(request.isActive());
    }

    private PageContentResponse toResponse(PageContentEntity entity) {
        return new PageContentResponse(
                entity.getId(),
                entity.getSectionKey(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
