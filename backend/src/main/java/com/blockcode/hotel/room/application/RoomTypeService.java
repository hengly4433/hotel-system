package com.blockcode.hotel.room.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.room.api.dto.RoomTypeImageRequest;
import com.blockcode.hotel.room.api.dto.RoomTypeImageResponse;
import com.blockcode.hotel.room.api.dto.RoomTypeRequest;
import com.blockcode.hotel.room.api.dto.RoomTypeResponse;
import com.blockcode.hotel.room.domain.RoomTypeEntity;
import com.blockcode.hotel.room.domain.RoomTypeImageEntity;
import com.blockcode.hotel.room.infra.RoomTypeImageRepository;
import com.blockcode.hotel.room.infra.RoomTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class RoomTypeService {
  private final RoomTypeRepository roomTypeRepository;
  private final RoomTypeImageRepository roomTypeImageRepository;

  public RoomTypeService(
      RoomTypeRepository roomTypeRepository,
      RoomTypeImageRepository roomTypeImageRepository
  ) {
    this.roomTypeRepository = roomTypeRepository;
    this.roomTypeImageRepository = roomTypeImageRepository;
  }

  public RoomTypeResponse create(RoomTypeRequest request) {
    if (roomTypeRepository.existsByPropertyIdAndCodeAndDeletedAtIsNull(request.propertyId(), request.code())) {
      throw new AppException("ROOM_TYPE_EXISTS", "Room type code already exists", HttpStatus.BAD_REQUEST);
    }

    RoomTypeEntity entity = new RoomTypeEntity();
    apply(entity, request);
    roomTypeRepository.save(entity);
    List<RoomTypeImageResponse> images = syncImages(entity.getId(), request.images());
    return toResponse(entity, images);
  }

  @Transactional(readOnly = true)
  public List<RoomTypeResponse> list() {
    List<RoomTypeEntity> entities = roomTypeRepository.findAllByDeletedAtIsNullOrderByNameAsc();
    return toResponses(entities);
  }

  @Transactional(readOnly = true)
  public List<RoomTypeResponse> listByPropertyId(UUID propertyId) {
    List<RoomTypeEntity> entities = roomTypeRepository.findAllByPropertyIdAndDeletedAtIsNullOrderByNameAsc(propertyId);
    return toResponses(entities);
  }

  @Transactional(readOnly = true)
  public RoomTypeResponse get(UUID id) {
    RoomTypeEntity entity = roomTypeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Room type not found", HttpStatus.NOT_FOUND));
    return toResponse(entity, getImages(entity.getId()));
  }

  public RoomTypeResponse update(UUID id, RoomTypeRequest request) {
    RoomTypeEntity entity = roomTypeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Room type not found", HttpStatus.NOT_FOUND));

    if (!entity.getCode().equalsIgnoreCase(request.code()) || !entity.getPropertyId().equals(request.propertyId())) {
      if (roomTypeRepository.existsByPropertyIdAndCodeAndDeletedAtIsNull(request.propertyId(), request.code())) {
        throw new AppException("ROOM_TYPE_EXISTS", "Room type code already exists", HttpStatus.BAD_REQUEST);
      }
    }

    apply(entity, request);
    roomTypeRepository.save(entity);
    List<RoomTypeImageResponse> images = syncImages(entity.getId(), request.images());
    return toResponse(entity, images);
  }

  public void softDelete(UUID id) {
    RoomTypeEntity entity = roomTypeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Room type not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    roomTypeRepository.save(entity);
  }

  private void apply(RoomTypeEntity entity, RoomTypeRequest request) {
    entity.setPropertyId(request.propertyId());
    entity.setCode(request.code());
    entity.setName(request.name());
    entity.setMaxAdults(request.maxAdults() == null ? 1 : request.maxAdults());
    entity.setMaxChildren(request.maxChildren() == null ? 0 : request.maxChildren());
    entity.setMaxOccupancy(request.maxOccupancy() == null ? 1 : request.maxOccupancy());
    entity.setBaseDescription(request.baseDescription());
    entity.setDefaultBedType(request.defaultBedType());
  }

  private List<RoomTypeResponse> toResponses(List<RoomTypeEntity> entities) {
    List<UUID> ids = entities.stream().map(RoomTypeEntity::getId).toList();
    Map<UUID, List<RoomTypeImageResponse>> imagesByType = fetchImages(ids);
    return entities.stream()
        .map(entity -> toResponse(entity, imagesByType.getOrDefault(entity.getId(), List.of())))
        .toList();
  }

  private Map<UUID, List<RoomTypeImageResponse>> fetchImages(List<UUID> roomTypeIds) {
    if (roomTypeIds.isEmpty()) {
      return Map.of();
    }
    List<RoomTypeImageEntity> images =
        roomTypeImageRepository.findAllByRoomTypeIdInAndDeletedAtIsNullOrderBySortOrderAsc(roomTypeIds);
    Map<UUID, List<RoomTypeImageResponse>> result = new HashMap<>();
    for (RoomTypeImageEntity image : images) {
      result.computeIfAbsent(image.getRoomTypeId(), id -> new ArrayList<>()).add(toImageResponse(image));
    }
    return result;
  }

  private List<RoomTypeImageResponse> getImages(UUID roomTypeId) {
    return roomTypeImageRepository.findAllByRoomTypeIdAndDeletedAtIsNullOrderBySortOrderAsc(roomTypeId)
        .stream()
        .map(this::toImageResponse)
        .toList();
  }

  private List<RoomTypeImageResponse> syncImages(UUID roomTypeId, List<RoomTypeImageRequest> images) {
    if (images == null) {
      return getImages(roomTypeId);
    }

    List<RoomTypeImageEntity> existing =
        roomTypeImageRepository.findAllByRoomTypeIdAndDeletedAtIsNullOrderBySortOrderAsc(roomTypeId);
    if (!existing.isEmpty()) {
      Instant now = Instant.now();
      for (RoomTypeImageEntity image : existing) {
        image.setDeletedAt(now);
      }
      roomTypeImageRepository.saveAll(existing);
    }

    boolean primarySet = false;
    int index = 0;
    List<RoomTypeImageEntity> replacements = new ArrayList<>();
    for (RoomTypeImageRequest request : images) {
      if (request == null || request.url() == null || request.url().isBlank()) {
        continue;
      }
      RoomTypeImageEntity image = new RoomTypeImageEntity();
      image.setRoomTypeId(roomTypeId);
      image.setUrl(request.url());
      image.setSortOrder(request.sortOrder() == null ? index : request.sortOrder());
      boolean isPrimary = request.isPrimary() != null && request.isPrimary();
      if (isPrimary && primarySet) {
        isPrimary = false;
      }
      if (isPrimary) {
        primarySet = true;
      }
      image.setPrimary(isPrimary);
      replacements.add(image);
      index += 1;
    }
    if (!primarySet && !replacements.isEmpty()) {
      replacements.get(0).setPrimary(true);
    }
    roomTypeImageRepository.saveAll(replacements);
    return getImages(roomTypeId);
  }

  private RoomTypeImageResponse toImageResponse(RoomTypeImageEntity image) {
    return new RoomTypeImageResponse(
        image.getId(),
        image.getUrl(),
        image.getSortOrder(),
        image.isPrimary()
    );
  }

  private RoomTypeResponse toResponse(RoomTypeEntity entity, List<RoomTypeImageResponse> images) {
    return new RoomTypeResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getCode(),
        entity.getName(),
        entity.getMaxAdults(),
        entity.getMaxChildren(),
        entity.getMaxOccupancy(),
        entity.getBaseDescription(),
        entity.getDefaultBedType(),
        images
    );
  }
}
