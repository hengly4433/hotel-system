package com.blockcode.hotel.blog.infra;

import com.blockcode.hotel.blog.domain.BlogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface BlogRepository extends JpaRepository<BlogEntity, UUID> {
    @Query("SELECT b FROM BlogEntity b WHERE b.isActive = true ORDER BY b.createdAt DESC")
    List<BlogEntity> findAllByActiveTrueOrderByCreatedAtDesc();
}
