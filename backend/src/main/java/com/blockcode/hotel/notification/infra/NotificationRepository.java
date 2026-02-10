package com.blockcode.hotel.notification.infra;

import com.blockcode.hotel.notification.domain.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
  List<NotificationEntity> findAllByIsReadFalseAndDeletedAtIsNullOrderByCreatedAtDesc();
  List<NotificationEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();
}
