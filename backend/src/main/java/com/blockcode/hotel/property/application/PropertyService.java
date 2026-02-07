package com.blockcode.hotel.property.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.organization.infra.OrganizationRepository;
import com.blockcode.hotel.property.api.dto.PropertyRequest;
import com.blockcode.hotel.property.api.dto.PropertyResponse;
import com.blockcode.hotel.property.domain.PropertyEntity;
import com.blockcode.hotel.property.infra.PropertyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PropertyService {
  private final PropertyRepository propertyRepository;
  private final OrganizationRepository organizationRepository;

  public PropertyService(PropertyRepository propertyRepository, OrganizationRepository organizationRepository) {
    this.propertyRepository = propertyRepository;
    this.organizationRepository = organizationRepository;
  }

  public PropertyResponse create(PropertyRequest request) {
    validateOrganization(request.organizationId());

    if (propertyRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedAtIsNull(
        request.organizationId(), request.name())) {
      throw new AppException("PROPERTY_EXISTS", "Property already exists", HttpStatus.BAD_REQUEST);
    }

    PropertyEntity entity = new PropertyEntity();
    apply(entity, request);
    propertyRepository.save(entity);

    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<PropertyResponse> list() {
    return propertyRepository.findAllByDeletedAtIsNullOrderByNameAsc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public PropertyResponse get(UUID id) {
    PropertyEntity entity = propertyRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Property not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public PropertyResponse update(UUID id, PropertyRequest request) {
    PropertyEntity entity = propertyRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Property not found", HttpStatus.NOT_FOUND));

    validateOrganization(request.organizationId());

    boolean nameChanged = !entity.getName().equalsIgnoreCase(request.name())
        || !entity.getOrganizationId().equals(request.organizationId());

    if (nameChanged
        && propertyRepository.existsByOrganizationIdAndNameIgnoreCaseAndDeletedAtIsNull(
        request.organizationId(), request.name())) {
      throw new AppException("PROPERTY_EXISTS", "Property already exists", HttpStatus.BAD_REQUEST);
    }

    apply(entity, request);
    propertyRepository.save(entity);

    return toResponse(entity);
  }

  public void softDelete(UUID id) {
    PropertyEntity entity = propertyRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Property not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    propertyRepository.save(entity);
  }

  private void validateOrganization(UUID organizationId) {
    if (organizationRepository.findByIdAndDeletedAtIsNull(organizationId).isEmpty()) {
      throw new AppException("ORG_NOT_FOUND", "Organization not found", HttpStatus.BAD_REQUEST);
    }
  }

  private void apply(PropertyEntity entity, PropertyRequest request) {
    entity.setOrganizationId(request.organizationId());
    entity.setName(request.name());
    entity.setTimezone(normalizeValue(request.timezone(), "Asia/Phnom_Penh"));
    entity.setCurrency(normalizeValue(request.currency(), "USD"));
    entity.setAddressLine1(request.addressLine1());
    entity.setAddressLine2(request.addressLine2());
    entity.setCity(request.city());
    entity.setState(request.state());
    entity.setPostalCode(request.postalCode());
    entity.setCountry(request.country());
  }

  private String normalizeValue(String value, String fallback) {
    if (value == null || value.isBlank()) {
      return fallback;
    }
    return value;
  }

  private PropertyResponse toResponse(PropertyEntity entity) {
    return new PropertyResponse(
        entity.getId(),
        entity.getOrganizationId(),
        entity.getName(),
        entity.getTimezone(),
        entity.getCurrency(),
        entity.getAddressLine1(),
        entity.getAddressLine2(),
        entity.getCity(),
        entity.getState(),
        entity.getPostalCode(),
        entity.getCountry()
    );
  }
}
