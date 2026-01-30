package com.yourorg.hotel.organization.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.organization.api.dto.OrganizationRequest;
import com.yourorg.hotel.organization.api.dto.OrganizationResponse;
import com.yourorg.hotel.organization.domain.OrganizationEntity;
import com.yourorg.hotel.organization.infra.OrganizationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrganizationService {
  private final OrganizationRepository organizationRepository;

  public OrganizationService(OrganizationRepository organizationRepository) {
    this.organizationRepository = organizationRepository;
  }

  public OrganizationResponse create(OrganizationRequest request) {
    if (organizationRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(request.name())) {
      throw new AppException("ORG_EXISTS", "Organization already exists", HttpStatus.BAD_REQUEST);
    }

    OrganizationEntity entity = new OrganizationEntity();
    entity.setName(request.name());
    organizationRepository.save(entity);

    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<OrganizationResponse> list() {
    return organizationRepository.findAllByDeletedAtIsNullOrderByNameAsc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public OrganizationResponse get(UUID id) {
    OrganizationEntity entity = organizationRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Organization not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public OrganizationResponse update(UUID id, OrganizationRequest request) {
    OrganizationEntity entity = organizationRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Organization not found", HttpStatus.NOT_FOUND));

    if (!entity.getName().equalsIgnoreCase(request.name())
        && organizationRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(request.name())) {
      throw new AppException("ORG_EXISTS", "Organization already exists", HttpStatus.BAD_REQUEST);
    }

    entity.setName(request.name());
    organizationRepository.save(entity);

    return toResponse(entity);
  }

  public void softDelete(UUID id) {
    OrganizationEntity entity = organizationRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Organization not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    organizationRepository.save(entity);
  }

  private OrganizationResponse toResponse(OrganizationEntity entity) {
    return new OrganizationResponse(entity.getId(), entity.getName());
  }
}
