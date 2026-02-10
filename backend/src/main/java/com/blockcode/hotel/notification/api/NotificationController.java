package com.blockcode.hotel.notification.api;

import com.blockcode.hotel.notification.api.dto.NotificationResponse;
import com.blockcode.hotel.notification.application.NotificationService;
import com.blockcode.hotel.notification.domain.NotificationEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/notifications")
public class NotificationController {
  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping
  public List<NotificationResponse> listUnread() {
    return notificationService.listUnread().stream()
        .map(this::toResponse)
        .toList();
  }

  @PutMapping("/{id}/read")
  public void markAsRead(@PathVariable UUID id) {
    notificationService.markAsRead(id);
  }

  private NotificationResponse toResponse(NotificationEntity entity) {
    return new NotificationResponse(
        entity.getId(),
        entity.getType(),
        entity.getTitle(),
        entity.getMessage(),
        entity.getLink(),
        entity.isRead(),
        entity.getCreatedAt()
    );
  }
}
