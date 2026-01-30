package com.yourorg.hotel.pricing.application;

import com.yourorg.hotel.audit.application.AuditService;
import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.pricing.api.dto.CancellationPolicyRequest;
import com.yourorg.hotel.pricing.api.dto.CancellationPolicyResponse;
import com.yourorg.hotel.pricing.domain.CancellationPolicyEntity;
import com.yourorg.hotel.pricing.infra.CancellationPolicyRepository;
import com.yourorg.hotel.property.infra.PropertyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CancellationPolicyService {
  private final CancellationPolicyRepository cancellationPolicyRepository;
  private final PropertyRepository propertyRepository;
  private final ObjectMapper objectMapper;
  private final AuditService auditService;

  public CancellationPolicyService(
      CancellationPolicyRepository cancellationPolicyRepository,
      PropertyRepository propertyRepository,
      ObjectMapper objectMapper,
      AuditService auditService
  ) {
    this.cancellationPolicyRepository = cancellationPolicyRepository;
    this.propertyRepository = propertyRepository;
    this.objectMapper = objectMapper;
    this.auditService = auditService;
  }

  public CancellationPolicyResponse create(CancellationPolicyRequest request) {
    validateProperty(request.propertyId());
    validateRules(request.rules());

    if (cancellationPolicyRepository.existsByPropertyIdAndNameIgnoreCaseAndDeletedAtIsNull(
        request.propertyId(), request.name())) {
      throw new AppException("CANCELLATION_POLICY_EXISTS", "Cancellation policy already exists", HttpStatus.BAD_REQUEST);
    }

    CancellationPolicyEntity entity = new CancellationPolicyEntity();
    apply(entity, request);
    cancellationPolicyRepository.save(entity);
    auditService.log("cancellation_policy", entity.getId(), "CREATE", null, entity, entity.getPropertyId());
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<CancellationPolicyResponse> list() {
    return cancellationPolicyRepository.findAllByDeletedAtIsNullOrderByNameAsc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public CancellationPolicyResponse get(UUID id) {
    CancellationPolicyEntity entity = cancellationPolicyRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Cancellation policy not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public CancellationPolicyResponse update(UUID id, CancellationPolicyRequest request) {
    CancellationPolicyEntity entity = cancellationPolicyRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Cancellation policy not found", HttpStatus.NOT_FOUND));

    validateProperty(request.propertyId());
    validateRules(request.rules());

    boolean nameChanged = !entity.getName().equalsIgnoreCase(request.name())
        || !entity.getPropertyId().equals(request.propertyId());
    if (nameChanged && cancellationPolicyRepository.existsByPropertyIdAndNameIgnoreCaseAndDeletedAtIsNull(
        request.propertyId(), request.name())) {
      throw new AppException("CANCELLATION_POLICY_EXISTS", "Cancellation policy already exists", HttpStatus.BAD_REQUEST);
    }

    apply(entity, request);
    cancellationPolicyRepository.save(entity);
    auditService.log("cancellation_policy", entity.getId(), "UPDATE", null, entity, entity.getPropertyId());
    return toResponse(entity);
  }

  public void softDelete(UUID id) {
    CancellationPolicyEntity entity = cancellationPolicyRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Cancellation policy not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    cancellationPolicyRepository.save(entity);
    auditService.log("cancellation_policy", entity.getId(), "DELETE", null, entity, entity.getPropertyId());
  }

  private void validateProperty(UUID propertyId) {
    if (propertyRepository.findByIdAndDeletedAtIsNull(propertyId).isEmpty()) {
      throw new AppException("PROPERTY_NOT_FOUND", "Property not found", HttpStatus.BAD_REQUEST);
    }
  }

  private void apply(CancellationPolicyEntity entity, CancellationPolicyRequest request) {
    entity.setPropertyId(request.propertyId());
    entity.setName(request.name());
    entity.setRules(request.rules());
  }

  private void validateRules(String rules) {
    try {
      objectMapper.readTree(rules);
    } catch (Exception ex) {
      throw new AppException("INVALID_RULES_JSON", "Rules must be valid JSON", HttpStatus.BAD_REQUEST);
    }
  }

  private CancellationPolicyResponse toResponse(CancellationPolicyEntity entity) {
    return new CancellationPolicyResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getName(),
        entity.getRules()
    );
  }
}
