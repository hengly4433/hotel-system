package com.blockcode.hotel.reservation.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.reservation.api.dto.RoomTypeAvailabilityDateResponse;
import com.blockcode.hotel.reservation.api.dto.RoomTypeAvailabilityResponse;
import com.blockcode.hotel.reservation.infra.ReservationNightRepository;
import com.blockcode.hotel.reservation.infra.ReservationTypeNightRepository;
import com.blockcode.hotel.room.domain.RoomTypeEntity;
import com.blockcode.hotel.room.infra.RoomRepository;
import com.blockcode.hotel.room.infra.RoomTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AvailabilityService {
  private final ReservationNightRepository reservationNightRepository;
  private final ReservationTypeNightRepository reservationTypeNightRepository;
  private final RoomRepository roomRepository;
  private final RoomTypeRepository roomTypeRepository;

  public AvailabilityService(
      ReservationNightRepository reservationNightRepository,
      ReservationTypeNightRepository reservationTypeNightRepository,
      RoomRepository roomRepository,
      RoomTypeRepository roomTypeRepository
  ) {
    this.reservationNightRepository = reservationNightRepository;
    this.reservationTypeNightRepository = reservationTypeNightRepository;
    this.roomRepository = roomRepository;
    this.roomTypeRepository = roomTypeRepository;
  }

  public boolean isRoomAvailable(UUID roomId, LocalDate from, LocalDate to) {
    if (from == null || to == null || !to.isAfter(from)) {
      throw new AppException("INVALID_DATES", "Invalid date range", HttpStatus.BAD_REQUEST);
    }

    boolean conflict = reservationNightRepository.existsConflict(roomId, from, to);
    return !conflict;
  }

  public List<RoomTypeAvailabilityResponse> getRoomTypeAvailability(UUID propertyId, LocalDate from, LocalDate to) {
    if (propertyId == null) {
      throw new AppException("PROPERTY_REQUIRED", "Property ID is required", HttpStatus.BAD_REQUEST);
    }
    if (from == null || to == null || !to.isAfter(from)) {
      throw new AppException("INVALID_DATES", "Invalid date range", HttpStatus.BAD_REQUEST);
    }

    List<RoomTypeEntity> roomTypes = roomTypeRepository
        .findAllByPropertyIdAndDeletedAtIsNullOrderByNameAsc(propertyId);
    if (roomTypes.isEmpty()) {
      return List.of();
    }

    Map<UUID, Integer> totalRoomsByType = new HashMap<>();
    for (Object[] row : roomRepository.countRoomsByRoomType(propertyId)) {
      UUID roomTypeId = (UUID) row[0];
      long count = (long) row[1];
      totalRoomsByType.put(roomTypeId, (int) count);
    }

    List<UUID> roomTypeIds = roomTypes.stream().map(RoomTypeEntity::getId).toList();

    Map<UUID, Map<LocalDate, Integer>> reservedByType = new HashMap<>();
    for (Object[] row : reservationNightRepository.countByRoomTypeAndDate(propertyId, from, to)) {
      UUID roomTypeId = (UUID) row[0];
      LocalDate date = (LocalDate) row[1];
      int count = ((Number) row[2]).intValue();
      reservedByType.computeIfAbsent(roomTypeId, k -> new HashMap<>()).put(date, count);
    }

    for (Object[] row : reservationTypeNightRepository.countByRoomTypeIdsAndDateRange(roomTypeIds, from, to)) {
      UUID roomTypeId = (UUID) row[0];
      LocalDate date = (LocalDate) row[1];
      int count = ((Number) row[2]).intValue();
      reservedByType
          .computeIfAbsent(roomTypeId, k -> new HashMap<>())
          .merge(date, count, Integer::sum);
    }

    List<RoomTypeAvailabilityResponse> response = new ArrayList<>();
    List<LocalDate> dates = from.datesUntil(to).toList();

    for (RoomTypeEntity roomType : roomTypes) {
      int totalRooms = totalRoomsByType.getOrDefault(roomType.getId(), 0);
      Map<LocalDate, Integer> reservedDates = reservedByType.getOrDefault(roomType.getId(), Map.of());
      List<RoomTypeAvailabilityDateResponse> dateResponses = new ArrayList<>();
      for (LocalDate date : dates) {
        int reserved = reservedDates.getOrDefault(date, 0);
        int available = Math.max(totalRooms - reserved, 0);
        dateResponses.add(new RoomTypeAvailabilityDateResponse(date, reserved, available));
      }
      response.add(new RoomTypeAvailabilityResponse(
          roomType.getId(),
          roomType.getCode(),
          roomType.getName(),
          totalRooms,
          dateResponses
      ));
    }

    return response;
  }
}
