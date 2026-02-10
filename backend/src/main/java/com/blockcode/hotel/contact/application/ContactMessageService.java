package com.blockcode.hotel.contact.application;

import com.blockcode.hotel.contact.domain.ContactMessageEntity;
import com.blockcode.hotel.contact.infra.ContactMessageRepository;
import com.blockcode.hotel.notification.application.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ContactMessageService {
  private final ContactMessageRepository contactMessageRepository;
  private final NotificationService notificationService;

  public ContactMessageService(
      ContactMessageRepository contactMessageRepository,
      NotificationService notificationService
  ) {
    this.contactMessageRepository = contactMessageRepository;
    this.notificationService = notificationService;
  }

  public void create(String name, String email, String phone, String message) {
    ContactMessageEntity entity = new ContactMessageEntity();
    entity.setName(name);
    entity.setEmail(email);
    entity.setPhone(phone);
    entity.setMessage(message);
    entity.setStatus("NEW");
    contactMessageRepository.save(entity);

    notificationService.create(
        "CONTACT",
        "New Contact Message",
        "From: " + name + " (" + email + ")",
        "/admin/contact" // Placeholder link
    );
  }
}
