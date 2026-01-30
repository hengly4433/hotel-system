package com.yourorg.hotel.pricing.application;

import com.yourorg.hotel.audit.application.AuditService;
import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.pricing.api.dto.RatePlanRequest;
import com.yourorg.hotel.pricing.api.dto.RatePlanResponse;
import com.yourorg.hotel.pricing.domain.CancellationPolicyEntity;
import com.yourorg.hotel.pricing.domain.RatePlanEntity;
import com.yourorg.hotel.pricing.infra.CancellationPolicyRepository;
import com.yourorg.hotel.pricing.infra.RatePlanRepository;
import com.yourorg.hotel.property.infra.PropertyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RatePlanService {
  private final RatePlanRepository ratePlanRepository;
  private final PropertyRepository propertyRepository;
  private final CancellationPolicyRepository cancellationPolicyRepository;
  private final AuditService auditService;

  public RatePlanService(
      RatePlanRepository ratePlanRepository,
      PropertyRepository propertyRepository,
      CancellationPolicyRepository cancellationPolicyRepository,
      AuditService auditService
  ) {
    this.ratePlanRepository = ratePlanRepository;
    this.propertyRepository = propertyRepository;
    this.cancellationPolicyRepository = cancellationPolicyRepository;
    this.auditService = auditService;
  }

  public RatePlanResponse create(RatePlanRequest request) {
    validateProperty(request.propertyId());
    validateCancellationPolicy(request.propertyId(), request.cancellationPolicyId());

    if (ratePlanRepository.existsByPropertyIdAndCodeAndDeletedAtIsNull(request.propertyId(), request.code())) {
      throw new AppException("RATE_PLAN_EXISTS", "Rate plan code already exists", HttpStatus.BAD_REQUEST);
    }

    RatePlanEntity entity = new RatePlanEntity();
    apply(entity, request);
    ratePlanRepository.save(entity);
    auditService.log("rate_plan", entity.getId(), "CREATE", null, entity, entity.getPropertyId());
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<RatePlanResponse> list() {
    return ratePlanRepository.findAllByDeletedAtIsNullOrderByNameAsc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public RatePlanResponse get(UUID id) {
    RatePlanEntity entity = ratePlanRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Rate plan not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public RatePlanResponse update(UUID id, RatePlanRequest request) {
    RatePlanEntity entity = ratePlanRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Rate plan not found", HttpStatus.NOT_FOUND));

    validateProperty(request.propertyId());
    validateCancellationPolicy(request.propertyId(), request.cancellationPolicyId());

    boolean codeChanged = !entity.getCode().equalsIgnoreCase(request.code());
    boolean propertyChanged = !entity.getPropertyId().equals(request.propertyId());
    if ((codeChanged || propertyChanged)
        && ratePlanRepository.existsByPropertyIdAndCodeAndDeletedAtIsNull(request.propertyId(), request.code())) {
      throw new AppException("RATE_PLAN_EXISTS", "Rate plan code already exists", HttpStatus.BAD_REQUEST);
    }

    apply(entity, request);
    ratePlanRepository.save(entity);
    auditService.log("rate_plan", entity.getId(), "UPDATE", null, entity, entity.getPropertyId());
    return toResponse(entity);
  }

  public void softDelete(UUID id) {
    RatePlanEntity entity = ratePlanRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Rate plan not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    ratePlanRepository.save(entity);
    auditService.log("rate_plan", entity.getId(), "DELETE", null, entity, entity.getPropertyId());
  }

  private void validateProperty(UUID propertyId) {
    if (propertyRepository.findByIdAndDeletedAtIsNull(propertyId).isEmpty()) {
      throw new AppException("PROPERTY_NOT_FOUND", "Property not found", HttpStatus.BAD_REQUEST);
    }
  }

  private void validateCancellationPolicy(UUID propertyId, UUID cancellationPolicyId) {
    if (cancellationPolicyId == null) {
      return;
    }
    CancellationPolicyEntity policy = cancellationPolicyRepository.findByIdAndDeletedAtIsNull(cancellationPolicyId)
        .orElseThrow(() -> new AppException("CANCELLATION_POLICY_NOT_FOUND", "Cancellation policy not found",
            HttpStatus.BAD_REQUEST));
    if (!policy.getPropertyId().equals(propertyId)) {
      throw new AppException("CANCELLATION_POLICY_PROPERTY_MISMATCH",
          "Cancellation policy must belong to the same property", HttpStatus.BAD_REQUEST);
    }
  }

  private void apply(RatePlanEntity entity, RatePlanRequest request) {
    entity.setPropertyId(request.propertyId());
    entity.setCode(request.code());
    entity.setName(request.name());
    entity.setRefundable(request.refundable() == null || request.refundable());
    entity.setIncludesBreakfast(request.includesBreakfast() != null && request.includesBreakfast());
    entity.setCancellationPolicyId(request.cancellationPolicyId());
  }

  private RatePlanResponse toResponse(RatePlanEntity entity) {
    return new RatePlanResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getCode(),
        entity.getName(),
        entity.isRefundable(),
        entity.isIncludesBreakfast(),
        entity.getCancellationPolicyId()
    );
  }
}
