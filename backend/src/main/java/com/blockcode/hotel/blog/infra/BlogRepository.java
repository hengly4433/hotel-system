package com.blockcode.hotel.blog.infra;

import com.blockcode.hotel.blog.domain.BlogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BlogRepository extends JpaRepository<BlogEntity, UUID> {
    List<BlogEntity> findAllByIsActiveTrueOrderByCreatedAtDesc();
}
