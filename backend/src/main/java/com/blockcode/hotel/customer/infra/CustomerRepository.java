package com.blockcode.hotel.customer.infra;

import com.blockcode.hotel.customer.domain.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<CustomerEntity, UUID> {
  Optional<CustomerEntity> findByIdAndDeletedAtIsNull(UUID id);

  Optional<CustomerEntity> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

  Optional<CustomerEntity> findByProviderSubjectAndDeletedAtIsNull(String providerSubject);
}
