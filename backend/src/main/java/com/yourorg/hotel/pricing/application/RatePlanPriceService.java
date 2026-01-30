package com.yourorg.hotel.pricing.application;

import com.yourorg.hotel.audit.application.AuditService;
import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.pricing.api.dto.RatePlanPriceRequest;
import com.yourorg.hotel.pricing.api.dto.RatePlanPriceResponse;
import com.yourorg.hotel.pricing.domain.RatePlanEntity;
import com.yourorg.hotel.pricing.domain.RatePlanPriceEntity;
import com.yourorg.hotel.pricing.infra.RatePlanPriceRepository;
import com.yourorg.hotel.pricing.infra.RatePlanRepository;
import com.yourorg.hotel.room.domain.RoomTypeEntity;
import com.yourorg.hotel.room.infra.RoomTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class RatePlanPriceService {
  private final RatePlanPriceRepository ratePlanPriceRepository;
  private final RatePlanRepository ratePlanRepository;
  private final RoomTypeRepository roomTypeRepository;
  private final AuditService auditService;

  public RatePlanPriceService(
      RatePlanPriceRepository ratePlanPriceRepository,
      RatePlanRepository ratePlanRepository,
      RoomTypeRepository roomTypeRepository,
      AuditService auditService
  ) {
    this.ratePlanPriceRepository = ratePlanPriceRepository;
    this.ratePlanRepository = ratePlanRepository;
    this.roomTypeRepository = roomTypeRepository;
    this.auditService = auditService;
  }

  public RatePlanPriceResponse create(RatePlanPriceRequest request) {
    RatePlanEntity ratePlan = requireRatePlan(request.ratePlanId());
    RoomTypeEntity roomType = requireRoomType(request.roomTypeId());
    ensureSameProperty(ratePlan, roomType);

    if (ratePlanPriceRepository.existsByRatePlanIdAndRoomTypeIdAndDateAndDeletedAtIsNull(
        request.ratePlanId(), request.roomTypeId(), request.date())) {
      throw new AppException("RATE_PLAN_PRICE_EXISTS", "Rate plan price already exists", HttpStatus.BAD_REQUEST);
    }

    RatePlanPriceEntity entity = new RatePlanPriceEntity();
    apply(entity, request);
    ratePlanPriceRepository.save(entity);
    auditService.log("rate_plan_price", entity.getId(), "CREATE", null, entity, ratePlan.getPropertyId());
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<RatePlanPriceResponse> list(UUID ratePlanId, UUID roomTypeId, LocalDate from, LocalDate to) {
    List<RatePlanPriceEntity> prices;
    if (ratePlanId != null && roomTypeId != null && from != null && to != null) {
      prices = ratePlanPriceRepository
          .findAllByRatePlanIdAndRoomTypeIdAndDateBetweenAndDeletedAtIsNullOrderByDateAsc(
              ratePlanId, roomTypeId, from, to);
    } else if (ratePlanId != null && roomTypeId != null) {
      prices = ratePlanPriceRepository
          .findAllByRatePlanIdAndRoomTypeIdAndDeletedAtIsNullOrderByDateAsc(ratePlanId, roomTypeId);
    } else if (ratePlanId != null) {
      prices = ratePlanPriceRepository
          .findAllByRatePlanIdAndDeletedAtIsNullOrderByDateAsc(ratePlanId);
    } else {
      prices = ratePlanPriceRepository.findAllByDeletedAtIsNullOrderByDateAsc();
    }

    if ((from != null || to != null) && !(ratePlanId != null && roomTypeId != null)) {
      LocalDate fromDate = from == null ? LocalDate.MIN : from;
      LocalDate toDate = to == null ? LocalDate.MAX : to;
      prices = prices.stream()
          .filter(price -> !price.getDate().isBefore(fromDate) && !price.getDate().isAfter(toDate))
          .toList();
    }

    return prices.stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public RatePlanPriceResponse get(UUID id) {
    RatePlanPriceEntity entity = ratePlanPriceRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Rate plan price not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public RatePlanPriceResponse update(UUID id, RatePlanPriceRequest request) {
    RatePlanPriceEntity entity = ratePlanPriceRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Rate plan price not found", HttpStatus.NOT_FOUND));

    RatePlanEntity ratePlan = requireRatePlan(request.ratePlanId());
    RoomTypeEntity roomType = requireRoomType(request.roomTypeId());
    ensureSameProperty(ratePlan, roomType);

    boolean keyChanged = !entity.getRatePlanId().equals(request.ratePlanId())
        || !entity.getRoomTypeId().equals(request.roomTypeId())
        || !entity.getDate().equals(request.date());
    if (keyChanged && ratePlanPriceRepository.existsByRatePlanIdAndRoomTypeIdAndDateAndDeletedAtIsNull(
        request.ratePlanId(), request.roomTypeId(), request.date())) {
      throw new AppException("RATE_PLAN_PRICE_EXISTS", "Rate plan price already exists", HttpStatus.BAD_REQUEST);
    }

    apply(entity, request);
    ratePlanPriceRepository.save(entity);
    auditService.log("rate_plan_price", entity.getId(), "UPDATE", null, entity, ratePlan.getPropertyId());
    return toResponse(entity);
  }

  public void softDelete(UUID id) {
    RatePlanPriceEntity entity = ratePlanPriceRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Rate plan price not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    ratePlanPriceRepository.save(entity);
    auditService.log("rate_plan_price", entity.getId(), "DELETE", null, entity, null);
  }

  public Map<LocalDate, RatePlanPriceEntity> findPricesByRange(UUID ratePlanId, UUID roomTypeId, LocalDate from, LocalDate to) {
    List<RatePlanPriceEntity> prices = ratePlanPriceRepository
        .findAllByRatePlanIdAndRoomTypeIdAndDateBetweenAndDeletedAtIsNullOrderByDateAsc(ratePlanId, roomTypeId, from, to);
    Map<LocalDate, RatePlanPriceEntity> result = new HashMap<>();
    for (RatePlanPriceEntity price : prices) {
      result.put(price.getDate(), price);
    }
    return result;
  }

  private RatePlanEntity requireRatePlan(UUID ratePlanId) {
    return ratePlanRepository.findByIdAndDeletedAtIsNull(ratePlanId)
        .orElseThrow(() -> new AppException("RATE_PLAN_NOT_FOUND", "Rate plan not found", HttpStatus.BAD_REQUEST));
  }

  private RoomTypeEntity requireRoomType(UUID roomTypeId) {
    return roomTypeRepository.findByIdAndDeletedAtIsNull(roomTypeId)
        .orElseThrow(() -> new AppException("ROOM_TYPE_NOT_FOUND", "Room type not found", HttpStatus.BAD_REQUEST));
  }

  private void ensureSameProperty(RatePlanEntity ratePlan, RoomTypeEntity roomType) {
    if (!ratePlan.getPropertyId().equals(roomType.getPropertyId())) {
      throw new AppException("PROPERTY_MISMATCH", "Rate plan and room type must belong to the same property",
          HttpStatus.BAD_REQUEST);
    }
  }

  private void apply(RatePlanPriceEntity entity, RatePlanPriceRequest request) {
    entity.setRatePlanId(request.ratePlanId());
    entity.setRoomTypeId(request.roomTypeId());
    entity.setDate(request.date());
    entity.setPrice(request.price());
    entity.setCurrency(request.currency() == null || request.currency().isBlank() ? "USD" : request.currency());
  }

  private RatePlanPriceResponse toResponse(RatePlanPriceEntity entity) {
    return new RatePlanPriceResponse(
        entity.getId(),
        entity.getRatePlanId(),
        entity.getRoomTypeId(),
        entity.getDate(),
        entity.getPrice(),
        entity.getCurrency()
    );
  }
}
