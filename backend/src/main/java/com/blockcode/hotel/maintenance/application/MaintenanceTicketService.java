package com.blockcode.hotel.maintenance.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.common.security.CurrentUserProvider;
import com.blockcode.hotel.maintenance.api.dto.MaintenanceTicketEventResponse;
import com.blockcode.hotel.maintenance.api.dto.MaintenanceTicketRequest;
import com.blockcode.hotel.maintenance.api.dto.MaintenanceTicketResponse;
import com.blockcode.hotel.maintenance.domain.MaintenancePriority;
import com.blockcode.hotel.maintenance.domain.MaintenanceStatus;
import com.blockcode.hotel.maintenance.domain.MaintenanceTicketEventEntity;
import com.blockcode.hotel.maintenance.domain.MaintenanceTicketEntity;
import com.blockcode.hotel.maintenance.infra.MaintenanceTicketEventRepository;
import com.blockcode.hotel.maintenance.infra.MaintenanceTicketRepository;
import com.blockcode.hotel.property.infra.PropertyRepository;
import com.blockcode.hotel.room.infra.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MaintenanceTicketService {
  private final MaintenanceTicketRepository ticketRepository;
  private final MaintenanceTicketEventRepository eventRepository;
  private final PropertyRepository propertyRepository;
  private final RoomRepository roomRepository;
  private final CurrentUserProvider currentUserProvider;

  public MaintenanceTicketService(
      MaintenanceTicketRepository ticketRepository,
      MaintenanceTicketEventRepository eventRepository,
      PropertyRepository propertyRepository,
      RoomRepository roomRepository,
      CurrentUserProvider currentUserProvider
  ) {
    this.ticketRepository = ticketRepository;
    this.eventRepository = eventRepository;
    this.propertyRepository = propertyRepository;
    this.roomRepository = roomRepository;
    this.currentUserProvider = currentUserProvider;
  }

  public MaintenanceTicketResponse create(MaintenanceTicketRequest request) {
    validateProperty(request.propertyId());
    validateRoom(request.roomId());

    MaintenanceTicketEntity entity = new MaintenanceTicketEntity();
    apply(entity, request);

    if (entity.getReportedByUserId() == null) {
      entity.setReportedByUserId(currentUserProvider.getCurrentUserId().orElse(null));
    }

    if (entity.getOpenedAt() == null) {
      entity.setOpenedAt(Instant.now());
    }
    if (entity.getDueAt() == null) {
      entity.setDueAt(defaultDueAt(entity.getOpenedAt(), entity.getPriority()));
    }

    ticketRepository.save(entity);
    recordStatusEvent(entity, entity.getStatus());
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<MaintenanceTicketResponse> list(UUID propertyId) {
    List<MaintenanceTicketEntity> tickets = propertyId == null
        ? ticketRepository.findAllByDeletedAtIsNullOrderByOpenedAtDesc()
        : ticketRepository.findAllByPropertyIdAndDeletedAtIsNullOrderByOpenedAtDesc(propertyId);
    return tickets.stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public MaintenanceTicketResponse get(UUID id) {
    MaintenanceTicketEntity entity = ticketRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Maintenance ticket not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public MaintenanceTicketResponse update(UUID id, MaintenanceTicketRequest request) {
    MaintenanceTicketEntity entity = ticketRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Maintenance ticket not found", HttpStatus.NOT_FOUND));

    validateProperty(request.propertyId());
    validateRoom(request.roomId());

    MaintenanceStatus previousStatus = entity.getStatus();
    apply(entity, request);

    if (entity.getStatus() == MaintenanceStatus.CLOSED && entity.getClosedAt() == null) {
      entity.setClosedAt(Instant.now());
    }

    ticketRepository.save(entity);
    if (previousStatus != entity.getStatus()) {
      recordStatusEvent(entity, entity.getStatus());
    }
    return toResponse(entity);
  }

  public MaintenanceTicketResponse start(UUID id) {
    MaintenanceTicketEntity entity = ticketRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Maintenance ticket not found", HttpStatus.NOT_FOUND));
    if (entity.getStatus() == MaintenanceStatus.OPEN) {
      entity.setStatus(MaintenanceStatus.IN_PROGRESS);
      ticketRepository.save(entity);
      recordStatusEvent(entity, entity.getStatus());
    }
    return toResponse(entity);
  }

  public MaintenanceTicketResponse resolve(UUID id) {
    MaintenanceTicketEntity entity = ticketRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Maintenance ticket not found", HttpStatus.NOT_FOUND));
    if (entity.getStatus() != MaintenanceStatus.CLOSED) {
      entity.setStatus(MaintenanceStatus.RESOLVED);
      ticketRepository.save(entity);
      recordStatusEvent(entity, entity.getStatus());
    }
    return toResponse(entity);
  }

  public MaintenanceTicketResponse close(UUID id) {
    MaintenanceTicketEntity entity = ticketRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Maintenance ticket not found", HttpStatus.NOT_FOUND));
    if (entity.getStatus() != MaintenanceStatus.CLOSED) {
      entity.setStatus(MaintenanceStatus.CLOSED);
      if (entity.getClosedAt() == null) {
        entity.setClosedAt(Instant.now());
      }
      ticketRepository.save(entity);
      recordStatusEvent(entity, entity.getStatus());
    }
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<MaintenanceTicketEventResponse> events(UUID ticketId) {
    ticketRepository.findByIdAndDeletedAtIsNull(ticketId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Maintenance ticket not found", HttpStatus.NOT_FOUND));
    return eventRepository.findAllByTicketIdOrderByChangedAtDesc(ticketId)
        .stream()
        .map(event -> new MaintenanceTicketEventResponse(
            event.getId(),
            event.getTicketId(),
            event.getStatus(),
            event.getChangedByUserId(),
            event.getChangedAt()
        ))
        .toList();
  }

  public void softDelete(UUID id) {
    MaintenanceTicketEntity entity = ticketRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Maintenance ticket not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    ticketRepository.save(entity);
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

  private void apply(MaintenanceTicketEntity entity, MaintenanceTicketRequest request) {
    entity.setPropertyId(request.propertyId());
    entity.setRoomId(request.roomId());
    entity.setPriority(request.priority() == null ? MaintenancePriority.MEDIUM : request.priority());
    entity.setStatus(request.status() == null ? MaintenanceStatus.OPEN : request.status());
    entity.setDescription(request.description());
    entity.setReportedByUserId(request.reportedByUserId());
    entity.setAssignedToEmployeeId(request.assignedToEmployeeId());
    if (request.openedAt() != null) {
      entity.setOpenedAt(request.openedAt());
    }
    entity.setClosedAt(request.closedAt());
    if (request.dueAt() != null) {
      entity.setDueAt(request.dueAt());
    } else if (entity.getDueAt() == null) {
      Instant opened = entity.getOpenedAt() == null ? Instant.now() : entity.getOpenedAt();
      entity.setDueAt(defaultDueAt(opened, entity.getPriority()));
    }
  }

  private MaintenanceTicketResponse toResponse(MaintenanceTicketEntity entity) {
    return new MaintenanceTicketResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getRoomId(),
        entity.getPriority(),
        entity.getStatus(),
        entity.getDescription(),
        entity.getReportedByUserId(),
        entity.getAssignedToEmployeeId(),
        entity.getOpenedAt(),
        entity.getClosedAt(),
        entity.getDueAt()
    );
  }

  private void recordStatusEvent(MaintenanceTicketEntity entity, MaintenanceStatus status) {
    MaintenanceTicketEventEntity event = new MaintenanceTicketEventEntity();
    event.setTicketId(entity.getId());
    event.setStatus(status);
    event.setChangedByUserId(currentUserProvider.getCurrentUserId().orElse(null));
    event.setChangedAt(Instant.now());
    eventRepository.save(event);
  }

  private Instant defaultDueAt(Instant openedAt, MaintenancePriority priority) {
    int hours = switch (priority) {
      case URGENT -> 4;
      case HIGH -> 24;
      case MEDIUM -> 48;
      case LOW -> 72;
    };
    return openedAt.plusSeconds(hours * 3600L);
  }
}
