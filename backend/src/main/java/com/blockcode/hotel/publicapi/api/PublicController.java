package com.blockcode.hotel.publicapi.api;

import com.blockcode.hotel.publicapi.api.dto.PublicPropertyResponse;
import com.blockcode.hotel.publicapi.api.dto.PublicReservationRequest;
import com.blockcode.hotel.publicapi.application.PublicReservationService;
import com.blockcode.hotel.reservation.api.dto.ReservationResponse;
import com.blockcode.hotel.reservation.api.dto.RoomTypeAvailabilityResponse;
import com.blockcode.hotel.reservation.application.AvailabilityService;
import com.blockcode.hotel.room.api.dto.RoomTypeResponse;
import com.blockcode.hotel.room.application.RoomTypeService;
import com.blockcode.hotel.pricing.api.dto.RatePlanResponse;
import com.blockcode.hotel.pricing.domain.RatePlanEntity;
import com.blockcode.hotel.pricing.domain.RatePlanPriceEntity;
import com.blockcode.hotel.pricing.infra.RatePlanPriceRepository;
import com.blockcode.hotel.pricing.infra.RatePlanRepository;
import com.blockcode.hotel.property.domain.PropertyEntity;
import com.blockcode.hotel.property.infra.PropertyRepository;
import com.blockcode.hotel.common.exception.AppException;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public")
public class PublicController {
  private final PropertyRepository propertyRepository;
  private final RoomTypeService roomTypeService;
  private final RatePlanRepository ratePlanRepository;
  private final RatePlanPriceRepository ratePlanPriceRepository;
  private final AvailabilityService availabilityService;
  private final PublicReservationService publicReservationService;

  public PublicController(
      PropertyRepository propertyRepository,
      RoomTypeService roomTypeService,
      RatePlanRepository ratePlanRepository,
      RatePlanPriceRepository ratePlanPriceRepository,
      AvailabilityService availabilityService,
      PublicReservationService publicReservationService
  ) {
    this.propertyRepository = propertyRepository;
    this.roomTypeService = roomTypeService;
    this.ratePlanRepository = ratePlanRepository;
    this.ratePlanPriceRepository = ratePlanPriceRepository;
    this.availabilityService = availabilityService;
    this.publicReservationService = publicReservationService;
  }

  @GetMapping("/properties")
  public List<PublicPropertyResponse> properties() {
    return propertyRepository.findAllByDeletedAtIsNullOrderByNameAsc()
        .stream()
        .map(this::toPublicPropertyResponse)
        .toList();
  }

  @GetMapping("/room-types")
  public List<RoomTypeResponse> roomTypes(@RequestParam UUID propertyId) {
    return roomTypeService.listByPropertyId(propertyId);
  }

  @GetMapping("/rate-plans")
  public List<RatePlanResponse> ratePlans(
      @RequestParam UUID propertyId,
      @RequestParam(required = false) UUID roomTypeId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
  ) {
    List<RatePlanEntity> plans = ratePlanRepository.findAllByPropertyIdAndDeletedAtIsNullOrderByNameAsc(propertyId);
    if (roomTypeId == null || from == null || to == null) {
      return plans.stream().map(this::toRatePlanResponse).toList();
    }

    if (!to.isAfter(from)) {
      throw new AppException("INVALID_DATES", "Check-out must be after check-in", org.springframework.http.HttpStatus.BAD_REQUEST);
    }

    List<LocalDate> dates = from.datesUntil(to).toList();
    if (dates.isEmpty()) {
      return List.of();
    }

    return plans.stream()
        .filter(plan -> hasPriceCoverage(plan.getId(), roomTypeId, dates))
        .map(this::toRatePlanResponse)
        .toList();
  }

  @GetMapping("/availability")
  public List<RoomTypeAvailabilityResponse> availability(
      @RequestParam UUID propertyId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(required = false) UUID roomTypeId
  ) {
    List<RoomTypeAvailabilityResponse> availability =
        availabilityService.getRoomTypeAvailability(propertyId, from, to);
    if (roomTypeId == null) {
      return availability;
    }
    return availability.stream()
        .filter(item -> item.roomTypeId().equals(roomTypeId))
        .toList();
  }

  @PostMapping("/reservations")
  public ReservationResponse createReservation(@Valid @RequestBody PublicReservationRequest request) {
    return publicReservationService.create(request);
  }

  @GetMapping("/reservations/me")
  public List<ReservationResponse> myReservations() {
    return publicReservationService.listMine();
  }

  @GetMapping("/reservations/{code}")
  public ReservationResponse getReservation(
      @PathVariable String code,
      @RequestParam String email
  ) {
    return publicReservationService.getByCode(code, email);
  }

  @PostMapping("/reservations/{code}/cancel")
  public ReservationResponse cancelReservation(
      @PathVariable String code,
      @RequestParam String email
  ) {
    return publicReservationService.cancelByCode(code, email);
  }

  private RatePlanResponse toRatePlanResponse(RatePlanEntity entity) {
    return new RatePlanResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getCode(),
        entity.getName(),
        entity.isRefundable(),
        entity.isIncludesBreakfast(),
        entity.getCancellationPolicyId()
    );
  }

  private boolean hasPriceCoverage(UUID ratePlanId, UUID roomTypeId, List<LocalDate> dates) {
    if (dates.isEmpty()) {
      return false;
    }
    LocalDate from = dates.get(0);
    LocalDate to = dates.get(dates.size() - 1);
    List<RatePlanPriceEntity> prices = ratePlanPriceRepository
        .findAllByRatePlanIdAndRoomTypeIdAndDateBetweenAndDeletedAtIsNullOrderByDateAsc(ratePlanId, roomTypeId, from, to);

    Map<LocalDate, RatePlanPriceEntity> priceMap = new HashMap<>();
    for (RatePlanPriceEntity price : prices) {
      priceMap.put(price.getDate(), price);
    }
    for (LocalDate date : dates) {
      if (!priceMap.containsKey(date)) {
        return false;
      }
    }
    return true;
  }

  private PublicPropertyResponse toPublicPropertyResponse(PropertyEntity entity) {
    return new PublicPropertyResponse(
        entity.getId(),
        entity.getName(),
        entity.getAddressLine1(),
        entity.getAddressLine2(),
        entity.getCity(),
        entity.getState(),
        entity.getPostalCode(),
        entity.getCountry()
    );
  }
}
