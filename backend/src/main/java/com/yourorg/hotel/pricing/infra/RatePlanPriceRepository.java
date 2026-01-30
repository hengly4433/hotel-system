package com.yourorg.hotel.pricing.infra;

import com.yourorg.hotel.pricing.domain.RatePlanPriceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RatePlanPriceRepository extends JpaRepository<RatePlanPriceEntity, UUID> {
  Optional<RatePlanPriceEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<RatePlanPriceEntity> findAllByDeletedAtIsNullOrderByDateAsc();

  List<RatePlanPriceEntity> findAllByRatePlanIdAndDeletedAtIsNullOrderByDateAsc(UUID ratePlanId);

  List<RatePlanPriceEntity> findAllByRatePlanIdAndRoomTypeIdAndDeletedAtIsNullOrderByDateAsc(
      UUID ratePlanId,
      UUID roomTypeId
  );

  List<RatePlanPriceEntity> findAllByRatePlanIdAndRoomTypeIdAndDateBetweenAndDeletedAtIsNullOrderByDateAsc(
      UUID ratePlanId,
      UUID roomTypeId,
      LocalDate from,
      LocalDate to
  );

  boolean existsByRatePlanIdAndRoomTypeIdAndDateAndDeletedAtIsNull(
      UUID ratePlanId,
      UUID roomTypeId,
      LocalDate date
  );
}
