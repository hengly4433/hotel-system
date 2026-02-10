package com.blockcode.hotel.contact.api;

import com.blockcode.hotel.contact.api.dto.ContactRequest;
import com.blockcode.hotel.contact.application.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/contact")
public class PublicContactController {
  private final ContactMessageService contactMessageService;

  public PublicContactController(ContactMessageService contactMessageService) {
    this.contactMessageService = contactMessageService;
  }

  @PostMapping
  public void sendMessage(@Valid @RequestBody ContactRequest request) {
    contactMessageService.create(
        request.name(),
        request.email(),
        request.phone(),
        request.message()
    );
  }
}
