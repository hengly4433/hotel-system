package com.blockcode.hotel.finance.infra;

import com.blockcode.hotel.finance.domain.FolioItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FolioItemRepository extends JpaRepository<FolioItemEntity, UUID> {
  List<FolioItemEntity> findAllByFolioIdAndDeletedAtIsNullOrderByPostedAtDesc(UUID folioId);
}
