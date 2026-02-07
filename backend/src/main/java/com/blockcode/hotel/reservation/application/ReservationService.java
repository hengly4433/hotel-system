package com.blockcode.hotel.reservation.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.blockcode.hotel.audit.application.AuditService;
import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.reservation.api.dto.NightlyRateRequest;
import com.blockcode.hotel.reservation.api.dto.ReservationCreateRequest;
import com.blockcode.hotel.reservation.api.dto.ReservationNightResponse;
import com.blockcode.hotel.reservation.api.dto.ReservationResponse;
import com.blockcode.hotel.reservation.api.dto.ReservationRoomRequest;
import com.blockcode.hotel.reservation.api.dto.ReservationRoomResponse;
import com.blockcode.hotel.reservation.api.dto.ReservationUpdateRequest;
import com.blockcode.hotel.reservation.domain.ReservationEntity;
import com.blockcode.hotel.reservation.domain.ReservationNightEntity;
import com.blockcode.hotel.reservation.domain.ReservationRoomEntity;
import com.blockcode.hotel.reservation.domain.ReservationStatus;
import com.blockcode.hotel.reservation.infra.ReservationNightRepository;
import com.blockcode.hotel.reservation.infra.ReservationRepository;
import com.blockcode.hotel.reservation.infra.ReservationRoomRepository;
import com.blockcode.hotel.reservation.infra.ReservationTypeNightRepository;
import com.blockcode.hotel.pricing.domain.RatePlanPriceEntity;
import com.blockcode.hotel.pricing.infra.RatePlanRepository;
import com.blockcode.hotel.pricing.application.RatePlanPriceService;
import com.blockcode.hotel.guest.infra.GuestRepository;
import com.blockcode.hotel.finance.application.FolioService;
import com.blockcode.hotel.finance.domain.FolioEntity;
import com.blockcode.hotel.finance.domain.FolioStatus;
import com.blockcode.hotel.finance.infra.FolioRepository;
import com.blockcode.hotel.room.infra.RoomRepository;
import com.blockcode.hotel.room.infra.RoomTypeRepository;
import com.blockcode.hotel.room.domain.RoomTypeEntity;
import com.blockcode.hotel.pricing.domain.RatePlanEntity;
import com.blockcode.hotel.room.domain.RoomEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class ReservationService {
  private final ReservationRepository reservationRepository;
  private final ReservationRoomRepository reservationRoomRepository;
  private final ReservationNightRepository reservationNightRepository;
  private final ReservationTypeNightRepository reservationTypeNightRepository;
  private final FolioRepository folioRepository;
  private final FolioService folioService;
  private final GuestRepository guestRepository;
  private final RatePlanRepository ratePlanRepository;
  private final RatePlanPriceService ratePlanPriceService;
  private final RoomRepository roomRepository;
  private final RoomTypeRepository roomTypeRepository;
  private final ObjectMapper objectMapper;
  private final AuditService auditService;

  public ReservationService(
      ReservationRepository reservationRepository,
      ReservationRoomRepository reservationRoomRepository,
      ReservationNightRepository reservationNightRepository,
      ReservationTypeNightRepository reservationTypeNightRepository,
      FolioRepository folioRepository,
      FolioService folioService,
      GuestRepository guestRepository,
      RatePlanRepository ratePlanRepository,
      RatePlanPriceService ratePlanPriceService,
      RoomRepository roomRepository,
      RoomTypeRepository roomTypeRepository,
      ObjectMapper objectMapper,
      AuditService auditService
  ) {
    this.reservationRepository = reservationRepository;
    this.reservationRoomRepository = reservationRoomRepository;
    this.reservationNightRepository = reservationNightRepository;
    this.reservationTypeNightRepository = reservationTypeNightRepository;
    this.folioRepository = folioRepository;
    this.folioService = folioService;
    this.guestRepository = guestRepository;
    this.ratePlanRepository = ratePlanRepository;
    this.ratePlanPriceService = ratePlanPriceService;
    this.roomRepository = roomRepository;
    this.roomTypeRepository = roomTypeRepository;
    this.objectMapper = objectMapper;
    this.auditService = auditService;
  }

  public ReservationResponse create(ReservationCreateRequest request) {
    if (!request.checkOutDate().isAfter(request.checkInDate())) {
      throw new AppException("INVALID_DATES", "Check-out must be after check-in", HttpStatus.BAD_REQUEST);
    }

    if (guestRepository.findByIdAndDeletedAtIsNull(request.primaryGuestId()).isEmpty()) {
      throw new AppException("GUEST_NOT_FOUND", "Primary guest not found", HttpStatus.BAD_REQUEST);
    }

    ReservationEntity reservation = new ReservationEntity();
    reservation.setPropertyId(request.propertyId());
    reservation.setPrimaryGuestId(request.primaryGuestId());
    reservation.setCode(request.code() == null || request.code().isBlank()
        ? generateCode()
        : request.code());
    reservation.setStatus(request.status() == null ? ReservationStatus.CONFIRMED : request.status());
    reservation.setChannel(request.channel() == null
        ? com.blockcode.hotel.reservation.domain.ChannelType.DIRECT
        : request.channel());
    reservation.setCheckInDate(request.checkInDate());
    reservation.setCheckOutDate(request.checkOutDate());
    reservation.setAdults(request.adults() == null ? 1 : request.adults());
    reservation.setChildren(request.children() == null ? 0 : request.children());
    reservation.setSpecialRequests(request.specialRequests());

    reservationRepository.save(reservation);
    auditService.log("reservation", reservation.getId(), "CREATE", null, reservation, reservation.getPropertyId());

    List<ReservationRoomEntity> rooms = new ArrayList<>();
    List<ReservationNightEntity> nights = new ArrayList<>();
    List<NightlyCharge> allCharges = new ArrayList<>();

    for (ReservationRoomRequest roomRequest : request.rooms()) {
      ReservationRoomEntity room = createReservationRoom(reservation, roomRequest);
      rooms.add(room);

      List<NightlyCharge> charges = calculateNightlyCharges(reservation, roomRequest);
      allCharges.addAll(charges);

      nights.addAll(createReservationNights(reservation, room, charges));

      if (room.getRoomId() == null) {
        createReservationTypeNights(room, charges);
      }

      room.setNightlyRateSnapshot(serializeNightlyCharges(charges));
      reservationRoomRepository.save(room);
    }

    createFolio(reservation);
    folioService.postReservationCharges(reservation.getId(), reservation.getPropertyId(), allCharges);

    return mapToResponse(reservation, rooms, nights);
  }

  @Transactional(readOnly = true)
  public List<ReservationResponse> list() {
    List<ReservationEntity> reservations = reservationRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc();
    List<ReservationResponse> result = new ArrayList<>();

    for (ReservationEntity reservation : reservations) {
      List<ReservationRoomEntity> rooms = reservationRoomRepository.findByReservationId(reservation.getId());
      List<ReservationNightEntity> nights = new ArrayList<>();
      for (ReservationRoomEntity room : rooms) {
        nights.addAll(reservationNightRepository.findByReservationRoomId(room.getId()));
      }
      result.add(mapToResponse(reservation, rooms, nights));
    }

    return result;
  }

  @Transactional(readOnly = true)
  public List<ReservationResponse> listByPrimaryGuestId(UUID primaryGuestId) {
    List<ReservationEntity> reservations =
        reservationRepository.findAllByPrimaryGuestIdAndDeletedAtIsNullOrderByCreatedAtDesc(primaryGuestId);
    List<ReservationResponse> result = new ArrayList<>();

    for (ReservationEntity reservation : reservations) {
      List<ReservationRoomEntity> rooms = reservationRoomRepository.findByReservationId(reservation.getId());
      List<ReservationNightEntity> nights = new ArrayList<>();
      for (ReservationRoomEntity room : rooms) {
        nights.addAll(reservationNightRepository.findByReservationRoomId(room.getId()));
      }
      result.add(mapToResponse(reservation, rooms, nights));
    }

    return result;
  }

  @Transactional(readOnly = true)
  public ReservationResponse get(UUID id) {
    ReservationEntity reservation = reservationRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Reservation not found", HttpStatus.NOT_FOUND));

    List<ReservationRoomEntity> rooms = reservationRoomRepository.findByReservationId(reservation.getId());
    List<ReservationNightEntity> nights = new ArrayList<>();
    for (ReservationRoomEntity room : rooms) {
      nights.addAll(reservationNightRepository.findByReservationRoomId(room.getId()));
    }

    return mapToResponse(reservation, rooms, nights);
  }

  public ReservationResponse checkIn(UUID id) {
    ReservationEntity reservation = reservationRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Reservation not found", HttpStatus.NOT_FOUND));
    Object before = objectMapper.convertValue(reservation, Map.class);
    reservation.setStatus(ReservationStatus.CHECKED_IN);
    reservationRepository.save(reservation);
    auditService.log("reservation", reservation.getId(), "CHECKIN", before, reservation, reservation.getPropertyId());
    return get(id);
  }

  public ReservationResponse checkOut(UUID id) {
    ReservationEntity reservation = reservationRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Reservation not found", HttpStatus.NOT_FOUND));
    Object before = objectMapper.convertValue(reservation, Map.class);
    reservation.setStatus(ReservationStatus.CHECKED_OUT);
    reservationRepository.save(reservation);
    auditService.log("reservation", reservation.getId(), "CHECKOUT", before, reservation, reservation.getPropertyId());
    return get(id);
  }

  public ReservationResponse cancel(UUID id) {
    ReservationEntity reservation = reservationRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Reservation not found", HttpStatus.NOT_FOUND));
    Object before = objectMapper.convertValue(reservation, Map.class);
    reservation.setStatus(ReservationStatus.CANCELLED);
    reservationRepository.save(reservation);

    List<ReservationRoomEntity> rooms = reservationRoomRepository.findByReservationId(reservation.getId());
    List<UUID> roomIds = rooms.stream().map(ReservationRoomEntity::getId).toList();
    if (!roomIds.isEmpty()) {
      Instant now = Instant.now();
      reservationNightRepository.softDeleteByReservationRoomIds(roomIds, now);
      reservationTypeNightRepository.softDeleteByReservationRoomIds(roomIds, now);
    }

    auditService.log("reservation", reservation.getId(), "CANCEL", before, reservation, reservation.getPropertyId());

    return get(id);
  }

  public ReservationResponse update(UUID id, ReservationUpdateRequest request) {
    ReservationEntity reservation = reservationRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Reservation not found", HttpStatus.NOT_FOUND));
    Object before = objectMapper.convertValue(reservation, Map.class);

    if (request.primaryGuestId() != null) {
      if (guestRepository.findByIdAndDeletedAtIsNull(request.primaryGuestId()).isEmpty()) {
        throw new AppException("GUEST_NOT_FOUND", "Primary guest not found", HttpStatus.BAD_REQUEST);
      }
      reservation.setPrimaryGuestId(request.primaryGuestId());
    }

    if (request.adults() != null) {
      reservation.setAdults(request.adults());
    }

    if (request.children() != null) {
      reservation.setChildren(request.children());
    }

    if (request.specialRequests() != null) {
      reservation.setSpecialRequests(request.specialRequests());
    }

    reservationRepository.save(reservation);
    auditService.log("reservation", reservation.getId(), "UPDATE", before, reservation, reservation.getPropertyId());

    List<ReservationRoomEntity> rooms = reservationRoomRepository.findByReservationId(reservation.getId());
    List<ReservationNightEntity> nights = new ArrayList<>();
    for (ReservationRoomEntity room : rooms) {
      nights.addAll(reservationNightRepository.findByReservationRoomId(room.getId()));
    }

    return mapToResponse(reservation, rooms, nights);
  }

  private ReservationRoomEntity createReservationRoom(ReservationEntity reservation, ReservationRoomRequest request) {
    RatePlanEntity ratePlan = ratePlanRepository.findByIdAndDeletedAtIsNull(request.ratePlanId())
        .orElseThrow(() -> new AppException("RATE_PLAN_NOT_FOUND", "Rate plan not found", HttpStatus.BAD_REQUEST));

    RoomTypeEntity roomType = roomTypeRepository.findByIdAndDeletedAtIsNull(request.roomTypeId())
        .orElseThrow(() -> new AppException("ROOM_TYPE_NOT_FOUND", "Room type not found", HttpStatus.BAD_REQUEST));

    if (!roomType.getPropertyId().equals(reservation.getPropertyId())) {
      throw new AppException("PROPERTY_MISMATCH", "Room type does not belong to property", HttpStatus.BAD_REQUEST);
    }

    if (!ratePlan.getPropertyId().equals(reservation.getPropertyId())) {
      throw new AppException("PROPERTY_MISMATCH", "Rate plan does not belong to property", HttpStatus.BAD_REQUEST);
    }

    if (request.roomId() != null) {
      RoomEntity roomEntity = roomRepository.findByIdAndDeletedAtIsNull(request.roomId())
          .orElseThrow(() -> new AppException("ROOM_NOT_FOUND", "Room not found", HttpStatus.BAD_REQUEST));
      if (!roomEntity.getPropertyId().equals(reservation.getPropertyId())) {
        throw new AppException("PROPERTY_MISMATCH", "Room does not belong to property", HttpStatus.BAD_REQUEST);
      }
      if (!roomEntity.getRoomTypeId().equals(roomType.getId())) {
        throw new AppException("ROOM_TYPE_MISMATCH", "Room does not match room type", HttpStatus.BAD_REQUEST);
      }
    }

    ReservationRoomEntity room = new ReservationRoomEntity();
    room.setReservationId(reservation.getId());
    room.setRoomTypeId(request.roomTypeId());
    room.setRoomId(request.roomId());
    room.setRatePlanId(request.ratePlanId());
    room.setGuestsInRoom(request.guestsInRoom() == null ? 1 : request.guestsInRoom());

    reservationRoomRepository.save(room);
    return room;
  }

  private List<ReservationNightEntity> createReservationNights(
      ReservationEntity reservation,
      ReservationRoomEntity room,
      List<NightlyCharge> charges
  ) {
    if (room.getRoomId() == null) {
      return List.of();
    }

    List<LocalDate> dates = reservation.getCheckInDate()
        .datesUntil(reservation.getCheckOutDate())
        .toList();

    if (dates.isEmpty()) {
      return List.of();
    }

    long conflicts = reservationNightRepository.countByRoomIdAndDateInAndDeletedAtIsNull(room.getRoomId(), dates);
    if (conflicts > 0) {
      throw new AppException("ROOM_UNAVAILABLE", "Room is not available for selected dates", HttpStatus.CONFLICT);
    }

    List<ReservationNightEntity> nights = new ArrayList<>();
    Map<LocalDate, NightlyCharge> chargeMap = new HashMap<>();
    for (NightlyCharge charge : charges) {
      chargeMap.put(charge.date(), charge);
    }
    for (LocalDate date : dates) {
      NightlyCharge charge = chargeMap.get(date);
      if (charge == null) {
        throw new AppException("RATE_PLAN_PRICE_MISSING", "Missing rate plan price for " + date, HttpStatus.BAD_REQUEST);
      }
      ReservationNightEntity night = new ReservationNightEntity();
      night.setReservationRoomId(room.getId());
      night.setRoomId(room.getRoomId());
      night.setDate(date);
      night.setPrice(charge.price());
      night.setCurrency(charge.currency());
      nights.add(night);
    }

    return reservationNightRepository.saveAll(nights);
  }

  private List<NightlyCharge> calculateNightlyCharges(ReservationEntity reservation, ReservationRoomRequest roomRequest) {
    List<LocalDate> dates = reservation.getCheckInDate()
        .datesUntil(reservation.getCheckOutDate())
        .toList();

    if (dates.isEmpty()) {
      return List.of();
    }

    Map<LocalDate, NightlyRateRequest> rateMap = new HashMap<>();
    if (roomRequest.nightlyRates() != null) {
      for (NightlyRateRequest rate : roomRequest.nightlyRates()) {
        rateMap.put(rate.date(), rate);
      }
    }

    boolean usePlanPrices = roomRequest.nightlyRates() == null || roomRequest.nightlyRates().isEmpty();
    Map<LocalDate, RatePlanPriceEntity> planPrices = new HashMap<>();
    if (usePlanPrices) {
      planPrices = ratePlanPriceService.findPricesByRange(
          roomRequest.ratePlanId(),
          roomRequest.roomTypeId(),
          dates.get(0),
          dates.get(dates.size() - 1)
      );
    }

    List<NightlyCharge> charges = new ArrayList<>();
    for (LocalDate date : dates) {
      if (usePlanPrices) {
        RatePlanPriceEntity price = planPrices.get(date);
        if (price == null) {
          throw new AppException("RATE_PLAN_PRICE_MISSING", "Missing rate plan price for " + date, HttpStatus.BAD_REQUEST);
        }
        charges.add(new NightlyCharge(date, price.getPrice(), price.getCurrency()));
      } else {
        NightlyRateRequest rate = rateMap.get(date);
        double rawPrice = rate != null ? rate.price() : 0.0;
        String currency = rate != null && rate.currency() != null ? rate.currency() : "USD";
        charges.add(new NightlyCharge(date, BigDecimal.valueOf(rawPrice), currency));
      }
    }

    return charges;
  }

  private JsonNode serializeNightlyCharges(List<NightlyCharge> charges) {
    if (charges == null) {
      return null;
    }
    return objectMapper.valueToTree(charges);
  }

  private void createReservationTypeNights(ReservationRoomEntity room, List<NightlyCharge> charges) {
    if (charges == null || charges.isEmpty()) {
      return;
    }

    List<LocalDate> dates = charges.stream().map(NightlyCharge::date).toList();
    ensureRoomTypeAvailability(room.getRoomTypeId(), dates);

    List<com.blockcode.hotel.reservation.domain.ReservationTypeNightEntity> nights = new ArrayList<>();
    for (NightlyCharge charge : charges) {
      com.blockcode.hotel.reservation.domain.ReservationTypeNightEntity night =
          new com.blockcode.hotel.reservation.domain.ReservationTypeNightEntity();
      night.setReservationRoomId(room.getId());
      night.setRoomTypeId(room.getRoomTypeId());
      night.setDate(charge.date());
      night.setPrice(charge.price());
      night.setCurrency(charge.currency());
      nights.add(night);
    }

    reservationTypeNightRepository.saveAll(nights);
  }

  private void ensureRoomTypeAvailability(UUID roomTypeId, List<LocalDate> dates) {
    long totalRooms = roomRepository.countByRoomTypeIdAndDeletedAtIsNullAndIsActiveTrue(roomTypeId);
    if (totalRooms <= 0) {
      throw new AppException("ROOM_TYPE_EMPTY", "No rooms available for selected room type", HttpStatus.CONFLICT);
    }

    for (LocalDate date : dates) {
      long assigned = reservationNightRepository.countAssignedByRoomTypeAndDate(roomTypeId, date);
      long unassigned = reservationTypeNightRepository.countByRoomTypeIdAndDateAndDeletedAtIsNull(roomTypeId, date);
      if (assigned + unassigned >= totalRooms) {
        throw new AppException("ROOM_TYPE_UNAVAILABLE", "Room type is not available for " + date, HttpStatus.CONFLICT);
      }
    }
  }

  private ReservationResponse mapToResponse(
      ReservationEntity reservation,
      List<ReservationRoomEntity> rooms,
      List<ReservationNightEntity> nights
  ) {
    Map<UUID, List<ReservationNightResponse>> nightsByRoom = new HashMap<>();
    for (ReservationNightEntity night : nights) {
      nightsByRoom.computeIfAbsent(night.getReservationRoomId(), k -> new ArrayList<>())
          .add(new ReservationNightResponse(
              night.getId(),
              night.getRoomId(),
              night.getDate(),
              night.getPrice() == null ? 0.0 : night.getPrice().doubleValue(),
              night.getCurrency()
          ));
    }

    List<ReservationRoomResponse> roomResponses = rooms.stream()
        .map(room -> new ReservationRoomResponse(
            room.getId(),
            room.getRoomTypeId(),
            room.getRoomId(),
            room.getRatePlanId(),
            room.getGuestsInRoom(),
            nightsByRoom.getOrDefault(room.getId(), List.of())
        ))
        .toList();

    return new ReservationResponse(
        reservation.getId(),
        reservation.getPropertyId(),
        reservation.getPrimaryGuestId(),
        reservation.getCode(),
        reservation.getStatus(),
        reservation.getChannel(),
        reservation.getCheckInDate(),
        reservation.getCheckOutDate(),
        reservation.getAdults(),
        reservation.getChildren(),
        reservation.getSpecialRequests(),
        roomResponses
    );
  }

  private String generateCode() {
    return "RES-" + Instant.now().toEpochMilli();
  }

  private void createFolio(ReservationEntity reservation) {
    FolioEntity folio = new FolioEntity();
    folio.setReservationId(reservation.getId());
    folio.setStatus(FolioStatus.OPEN);
    folio.setCurrency("USD");
    folioRepository.save(folio);
  }
}
