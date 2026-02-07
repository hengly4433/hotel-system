package com.blockcode.hotel.room.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.room.api.dto.RoomImageRequest;
import com.blockcode.hotel.room.api.dto.RoomImageResponse;
import com.blockcode.hotel.room.api.dto.RoomRequest;
import com.blockcode.hotel.room.api.dto.RoomResponse;
import com.blockcode.hotel.room.domain.RoomEntity;
import com.blockcode.hotel.room.domain.RoomImageEntity;
import com.blockcode.hotel.room.infra.RoomImageRepository;
import com.blockcode.hotel.room.infra.RoomRepository;
import com.blockcode.hotel.room.infra.RoomTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RoomService {
  private final RoomRepository roomRepository;
  private final RoomTypeRepository roomTypeRepository;
  private final RoomImageRepository roomImageRepository;

  public RoomService(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository,
      RoomImageRepository roomImageRepository) {
    this.roomRepository = roomRepository;
    this.roomTypeRepository = roomTypeRepository;
    this.roomImageRepository = roomImageRepository;
  }

  public RoomResponse create(RoomRequest request) {
    if (roomRepository.existsByPropertyIdAndRoomNumberAndDeletedAtIsNull(request.propertyId(), request.roomNumber())) {
      throw new AppException("ROOM_EXISTS", "Room number already exists", HttpStatus.BAD_REQUEST);
    }

    var roomType = roomTypeRepository.findByIdAndDeletedAtIsNull(request.roomTypeId())
        .orElseThrow(() -> new AppException("ROOM_TYPE_NOT_FOUND", "Room type not found", HttpStatus.BAD_REQUEST));
    if (!roomType.getPropertyId().equals(request.propertyId())) {
      throw new AppException("PROPERTY_MISMATCH", "Room type does not belong to property", HttpStatus.BAD_REQUEST);
    }

    RoomEntity entity = new RoomEntity();
    apply(entity, request);
    roomRepository.save(entity);

    saveImages(entity.getId(), request.galleryImages());

    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<RoomResponse> list() {
    return roomRepository.findAllByDeletedAtIsNullOrderByRoomNumberAsc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public RoomResponse get(UUID id) {
    RoomEntity entity = roomRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Room not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public RoomResponse update(UUID id, RoomRequest request) {
    RoomEntity entity = roomRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Room not found", HttpStatus.NOT_FOUND));

    if (!entity.getRoomNumber().equalsIgnoreCase(request.roomNumber())
        || !entity.getPropertyId().equals(request.propertyId())) {
      if (roomRepository.existsByPropertyIdAndRoomNumberAndDeletedAtIsNull(request.propertyId(),
          request.roomNumber())) {
        throw new AppException("ROOM_EXISTS", "Room number already exists", HttpStatus.BAD_REQUEST);
      }
    }

    var roomType = roomTypeRepository.findByIdAndDeletedAtIsNull(request.roomTypeId())
        .orElseThrow(() -> new AppException("ROOM_TYPE_NOT_FOUND", "Room type not found", HttpStatus.BAD_REQUEST));
    if (!roomType.getPropertyId().equals(request.propertyId())) {
      throw new AppException("PROPERTY_MISMATCH", "Room type does not belong to property", HttpStatus.BAD_REQUEST);
    }

    apply(entity, request);
    roomRepository.save(entity);
    saveImages(entity.getId(), request.galleryImages());
    return toResponse(entity);
  }

  public void softDelete(UUID id) {
    RoomEntity entity = roomRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Room not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    roomRepository.save(entity);
  }

  private void apply(RoomEntity entity, RoomRequest request) {
    entity.setPropertyId(request.propertyId());
    entity.setRoomTypeId(request.roomTypeId());
    entity.setRoomNumber(request.roomNumber());
    entity.setFloor(request.floor());
    entity.setHousekeepingZone(request.housekeepingZone());
    entity.setActive(request.isActive() == null || request.isActive());
    entity.setProfileImage(request.profileImage());
  }

  private void saveImages(UUID roomId, List<RoomImageRequest> images) {
    roomImageRepository.deleteAllByRoomId(roomId);
    if (images != null) {
      for (RoomImageRequest imgRequest : images) {
        RoomImageEntity imageEntity = new RoomImageEntity();
        imageEntity.setRoomId(roomId);
        imageEntity.setUrl(imgRequest.url());
        imageEntity.setSortOrder(imgRequest.sortOrder());
        roomImageRepository.save(imageEntity);
      }
    }
  }

  private RoomResponse toResponse(RoomEntity entity) {
    List<RoomImageResponse> gallery = roomImageRepository.findAllByRoomIdOrderBySortOrderAsc(entity.getId())
        .stream()
        .map(img -> new RoomImageResponse(img.getId(), img.getUrl(), img.getSortOrder()))
        .toList();

    return new RoomResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getRoomTypeId(),
        entity.getRoomNumber(),
        entity.getFloor(),
        entity.getHousekeepingZone(),
        entity.isActive(),
        entity.getProfileImage(),
        gallery);
  }
}
