package com.blockcode.hotel.contact.infra;

import com.blockcode.hotel.contact.domain.ContactMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, UUID> {
  List<ContactMessageEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();
}
