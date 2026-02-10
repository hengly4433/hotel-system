package com.blockcode.hotel.notification.application;

import com.blockcode.hotel.notification.domain.NotificationEntity;
import com.blockcode.hotel.notification.infra.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class NotificationService {
  private final NotificationRepository notificationRepository;

  public NotificationService(NotificationRepository notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  public NotificationEntity create(String type, String title, String message, String link) {
    NotificationEntity notification = new NotificationEntity();
    notification.setType(type);
    notification.setTitle(title);
    notification.setMessage(message);
    notification.setLink(link);
    notification.setRead(false);
    return notificationRepository.save(notification);
  }

  @Transactional(readOnly = true)
  public List<NotificationEntity> listUnread() {
    return notificationRepository.findAllByIsReadFalseAndDeletedAtIsNullOrderByCreatedAtDesc();
  }

  public void markAsRead(UUID id) {
    notificationRepository.findById(id).ifPresent(notification -> {
      notification.setRead(true);
      notificationRepository.save(notification);
    });
  }
}
