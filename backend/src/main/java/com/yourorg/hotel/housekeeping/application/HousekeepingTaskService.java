package com.yourorg.hotel.housekeeping.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.common.security.CurrentUserProvider;
import com.yourorg.hotel.housekeeping.api.dto.HousekeepingBoardRowResponse;
import com.yourorg.hotel.housekeeping.api.dto.HousekeepingTaskEventResponse;
import com.yourorg.hotel.housekeeping.api.dto.HousekeepingTaskRequest;
import com.yourorg.hotel.housekeeping.api.dto.HousekeepingTaskResponse;
import com.yourorg.hotel.housekeeping.domain.HousekeepingStatus;
import com.yourorg.hotel.housekeeping.domain.HousekeepingTaskEventEntity;
import com.yourorg.hotel.housekeeping.domain.HousekeepingTaskEntity;
import com.yourorg.hotel.housekeeping.domain.WorkShift;
import com.yourorg.hotel.housekeeping.infra.HousekeepingTaskEventRepository;
import com.yourorg.hotel.housekeeping.infra.HousekeepingTaskRepository;
import com.yourorg.hotel.property.infra.PropertyRepository;
import com.yourorg.hotel.room.domain.RoomEntity;
import com.yourorg.hotel.room.infra.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class HousekeepingTaskService {
  private final HousekeepingTaskRepository taskRepository;
  private final HousekeepingTaskEventRepository eventRepository;
  private final PropertyRepository propertyRepository;
  private final RoomRepository roomRepository;
  private final CurrentUserProvider currentUserProvider;

  public HousekeepingTaskService(
      HousekeepingTaskRepository taskRepository,
      HousekeepingTaskEventRepository eventRepository,
      PropertyRepository propertyRepository,
      RoomRepository roomRepository,
      CurrentUserProvider currentUserProvider
  ) {
    this.taskRepository = taskRepository;
    this.eventRepository = eventRepository;
    this.propertyRepository = propertyRepository;
    this.roomRepository = roomRepository;
    this.currentUserProvider = currentUserProvider;
  }

  public HousekeepingTaskResponse create(HousekeepingTaskRequest request) {
    validateProperty(request.propertyId());
    validateRoom(request.roomId());

    HousekeepingTaskEntity entity = new HousekeepingTaskEntity();
    apply(entity, request);
    taskRepository.save(entity);
    recordStatusEvent(entity, entity.getStatus());

    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<HousekeepingTaskResponse> list(UUID propertyId) {
    List<HousekeepingTaskEntity> tasks = propertyId == null
        ? taskRepository.findAllByDeletedAtIsNullOrderByTaskDateDesc()
        : taskRepository.findAllByPropertyIdAndDeletedAtIsNullOrderByTaskDateDesc(propertyId);

    return tasks.stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public HousekeepingTaskResponse get(UUID id) {
    HousekeepingTaskEntity entity = taskRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Housekeeping task not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public HousekeepingTaskResponse update(UUID id, HousekeepingTaskRequest request) {
    HousekeepingTaskEntity entity = taskRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Housekeeping task not found", HttpStatus.NOT_FOUND));

    validateProperty(request.propertyId());
    validateRoom(request.roomId());

    HousekeepingStatus previousStatus = entity.getStatus();
    apply(entity, request);
    taskRepository.save(entity);
    if (previousStatus != entity.getStatus()) {
      recordStatusEvent(entity, entity.getStatus());
    }
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<HousekeepingTaskEventResponse> events(UUID taskId) {
    taskRepository.findByIdAndDeletedAtIsNull(taskId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Housekeeping task not found", HttpStatus.NOT_FOUND));
    return eventRepository.findAllByTaskIdOrderByChangedAtDesc(taskId)
        .stream()
        .map(event -> new HousekeepingTaskEventResponse(
            event.getId(),
            event.getTaskId(),
            event.getStatus(),
            event.getChangedByUserId(),
            event.getChangedAt()
        ))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<HousekeepingBoardRowResponse> board(UUID propertyId, LocalDate date, WorkShift shift) {
    validateProperty(propertyId);

    List<HousekeepingTaskEntity> tasks = shift == null
        ? taskRepository.findAllByPropertyIdAndTaskDateAndDeletedAtIsNullOrderByRoomIdAsc(propertyId, date)
        : taskRepository.findAllByPropertyIdAndTaskDateAndShiftAndDeletedAtIsNullOrderByRoomIdAsc(
        propertyId, date, shift);

    List<UUID> roomIds = tasks.stream().map(HousekeepingTaskEntity::getRoomId).distinct().toList();
    Map<UUID, String> roomNumbers = new HashMap<>();
    if (!roomIds.isEmpty()) {
      List<RoomEntity> rooms = roomRepository.findAllByIdInAndDeletedAtIsNull(roomIds);
      for (RoomEntity room : rooms) {
        roomNumbers.put(room.getId(), room.getRoomNumber());
      }
    }

    return tasks.stream()
        .map(task -> new HousekeepingBoardRowResponse(
            task.getId(),
            task.getRoomId(),
            roomNumbers.getOrDefault(task.getRoomId(), task.getRoomId().toString()),
            task.getTaskDate(),
            task.getShift(),
            task.getStatus(),
            task.getAssignedToEmployeeId(),
            task.getDueAt()
        ))
        .toList();
  }

  public void softDelete(UUID id) {
    HousekeepingTaskEntity entity = taskRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Housekeeping task not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    taskRepository.save(entity);
  }

  private void validateProperty(UUID propertyId) {
    if (propertyRepository.findByIdAndDeletedAtIsNull(propertyId).isEmpty()) {
      throw new AppException("PROPERTY_NOT_FOUND", "Property not found", HttpStatus.BAD_REQUEST);
    }
  }

  private void validateRoom(UUID roomId) {
    if (roomRepository.findByIdAndDeletedAtIsNull(roomId).isEmpty()) {
      throw new AppException("ROOM_NOT_FOUND", "Room not found", HttpStatus.BAD_REQUEST);
    }
  }

  private void apply(HousekeepingTaskEntity entity, HousekeepingTaskRequest request) {
    entity.setPropertyId(request.propertyId());
    entity.setRoomId(request.roomId());
    entity.setTaskDate(request.taskDate());
    entity.setShift(request.shift() == null ? WorkShift.AM : request.shift());
    entity.setStatus(request.status() == null ? HousekeepingStatus.PENDING : request.status());
    entity.setAssignedToEmployeeId(request.assignedToEmployeeId());
    entity.setChecklist(request.checklist());
    if (request.dueAt() != null) {
      entity.setDueAt(request.dueAt());
    } else if (entity.getDueAt() == null) {
      entity.setDueAt(defaultDueAt(entity.getTaskDate(), entity.getShift()));
    }
  }

  private HousekeepingTaskResponse toResponse(HousekeepingTaskEntity entity) {
    return new HousekeepingTaskResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getRoomId(),
        entity.getTaskDate(),
        entity.getShift(),
        entity.getStatus(),
        entity.getAssignedToEmployeeId(),
        entity.getChecklist(),
        entity.getDueAt()
    );
  }

  private void recordStatusEvent(HousekeepingTaskEntity entity, HousekeepingStatus status) {
    HousekeepingTaskEventEntity event = new HousekeepingTaskEventEntity();
    event.setTaskId(entity.getId());
    event.setStatus(status);
    event.setChangedByUserId(currentUserProvider.getCurrentUserId().orElse(null));
    event.setChangedAt(Instant.now());
    eventRepository.save(event);
  }

  private Instant defaultDueAt(LocalDate taskDate, WorkShift shift) {
    int hour = switch (shift) {
      case AM -> 12;
      case PM -> 18;
      case NIGHT -> 2;
    };
    LocalDate effectiveDate = shift == WorkShift.NIGHT ? taskDate.plusDays(1) : taskDate;
    ZonedDateTime zdt = effectiveDate.atTime(hour, 0).atZone(ZoneId.systemDefault());
    return zdt.toInstant();
  }
}
