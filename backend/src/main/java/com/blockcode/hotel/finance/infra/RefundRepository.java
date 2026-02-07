package com.blockcode.hotel.finance.infra;

import com.blockcode.hotel.finance.domain.RefundEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RefundRepository extends JpaRepository<RefundEntity, UUID> {
  List<RefundEntity> findAllByPaymentIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID paymentId);
}
