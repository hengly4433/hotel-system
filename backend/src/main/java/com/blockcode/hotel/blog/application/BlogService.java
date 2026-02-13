package com.blockcode.hotel.blog.application;

import com.blockcode.hotel.blog.api.dto.BlogRequest;
import com.blockcode.hotel.blog.api.dto.BlogResponse;
import com.blockcode.hotel.blog.domain.BlogEntity;
import com.blockcode.hotel.blog.infra.BlogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BlogService {
    private final BlogRepository blogRepository;

    public BlogService(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    public BlogResponse create(BlogRequest request) {
        BlogEntity entity = new BlogEntity();
        updateEntity(entity, request);
        BlogEntity saved = blogRepository.save(entity);
        return toResponse(saved);
    }

    public BlogResponse update(UUID id, BlogRequest request) {
        BlogEntity entity = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found"));
        updateEntity(entity, request);
        return toResponse(blogRepository.save(entity));
    }

    public BlogResponse get(UUID id) {
        return blogRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found"));
    }

    public List<BlogResponse> listAdmin() {
        return blogRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BlogResponse> listPublic() {
        return blogRepository.findAllByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public void delete(UUID id) {
        blogRepository.deleteById(id);
    }

    private void updateEntity(BlogEntity entity, BlogRequest request) {
        entity.setTitle(request.title());
        entity.setSlug(request.slug());
        entity.setTag(request.tag());
        entity.setDescription(request.description());
        entity.setImageUrl(request.imageUrl());
        entity.setContent(request.content());
        entity.setActive(request.isActive());
    }

    private BlogResponse toResponse(BlogEntity entity) {
        return new BlogResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getSlug(),
                entity.getTag(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getContent(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
