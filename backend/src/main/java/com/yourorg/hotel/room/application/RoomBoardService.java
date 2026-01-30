package com.yourorg.hotel.room.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.reservation.infra.ReservationNightRepository;
import com.yourorg.hotel.room.api.dto.RoomBoardRowResponse;
import com.yourorg.hotel.room.domain.RoomEntity;
import com.yourorg.hotel.room.infra.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RoomBoardService {
  private final RoomRepository roomRepository;
  private final ReservationNightRepository reservationNightRepository;

  public RoomBoardService(RoomRepository roomRepository, ReservationNightRepository reservationNightRepository) {
    this.roomRepository = roomRepository;
    this.reservationNightRepository = reservationNightRepository;
  }

  public List<RoomBoardRowResponse> getRoomBoard(UUID propertyId, LocalDate from, LocalDate to) {
    if (propertyId == null) {
      throw new AppException("PROPERTY_REQUIRED", "Property ID is required", HttpStatus.BAD_REQUEST);
    }
    if (from == null || to == null || !to.isAfter(from)) {
      throw new AppException("INVALID_DATES", "Invalid date range", HttpStatus.BAD_REQUEST);
    }

    List<RoomEntity> rooms = roomRepository.findAllByPropertyIdAndDeletedAtIsNullOrderByRoomNumberAsc(propertyId);
    Map<UUID, List<LocalDate>> datesByRoom = new HashMap<>();

    List<Object[]> rows = reservationNightRepository.findRoomBoardDates(propertyId, from, to);
    for (Object[] row : rows) {
      UUID roomId = (UUID) row[0];
      LocalDate date = (LocalDate) row[1];
      datesByRoom.computeIfAbsent(roomId, k -> new ArrayList<>()).add(date);
    }

    List<RoomBoardRowResponse> response = new ArrayList<>();
    for (RoomEntity room : rooms) {
      response.add(new RoomBoardRowResponse(
          room.getId(),
          room.getRoomNumber(),
          datesByRoom.getOrDefault(room.getId(), List.of())
      ));
    }

    return response;
  }
}
