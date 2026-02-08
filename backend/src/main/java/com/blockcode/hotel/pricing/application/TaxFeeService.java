package com.blockcode.hotel.pricing.application;

import com.blockcode.hotel.audit.application.AuditService;
import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.pricing.api.dto.TaxFeeRequest;
import com.blockcode.hotel.pricing.api.dto.TaxFeeResponse;
import com.blockcode.hotel.pricing.domain.TaxFeeEntity;
import com.blockcode.hotel.pricing.infra.TaxFeeRepository;
import com.blockcode.hotel.property.infra.PropertyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class TaxFeeService {
  private static final Set<String> ALLOWED_APPLIES_TO = Set.of("ROOM", "SERVICE", "ALL");

  private final TaxFeeRepository taxFeeRepository;
  private final PropertyRepository propertyRepository;
  private final AuditService auditService;

  public TaxFeeService(
      TaxFeeRepository taxFeeRepository,
      PropertyRepository propertyRepository,
      AuditService auditService
  ) {
    this.taxFeeRepository = taxFeeRepository;
    this.propertyRepository = propertyRepository;
    this.auditService = auditService;
  }

  public TaxFeeResponse create(TaxFeeRequest request) {
    validateProperty(request.propertyId());
    validateAppliesTo(request.appliesTo());

    if (taxFeeRepository.existsByPropertyIdAndNameAndDeletedAtIsNull(request.propertyId(), request.name())) {
      throw new AppException("TAX_FEE_EXISTS", "Tax or fee already exists", HttpStatus.BAD_REQUEST);
    }

    TaxFeeEntity entity = new TaxFeeEntity();
    apply(entity, request);
    taxFeeRepository.save(entity);
    auditService.log("tax_fee", entity.getId(), "CREATE", null, entity, entity.getPropertyId());
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<TaxFeeResponse> list() {
    return taxFeeRepository.findAllByDeletedAtIsNullOrderByNameAsc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public TaxFeeResponse get(UUID id) {
    TaxFeeEntity entity = taxFeeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Tax or fee not found", HttpStatus.NOT_FOUND));
    return toResponse(entity);
  }

  public TaxFeeResponse update(UUID id, TaxFeeRequest request) {
    TaxFeeEntity entity = taxFeeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Tax or fee not found", HttpStatus.NOT_FOUND));

    validateProperty(request.propertyId());
    validateAppliesTo(request.appliesTo());

    boolean nameChanged = !entity.getName().equalsIgnoreCase(request.name())
        || !entity.getPropertyId().equals(request.propertyId());
    if (nameChanged && taxFeeRepository.existsByPropertyIdAndNameAndDeletedAtIsNull(request.propertyId(), request.name())) {
      throw new AppException("TAX_FEE_EXISTS", "Tax or fee already exists", HttpStatus.BAD_REQUEST);
    }

    apply(entity, request);
    taxFeeRepository.save(entity);
    auditService.log("tax_fee", entity.getId(), "UPDATE", null, entity, entity.getPropertyId());
    return toResponse(entity);
  }

  public void softDelete(UUID id) {
    TaxFeeEntity entity = taxFeeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Tax or fee not found", HttpStatus.NOT_FOUND));
    entity.setDeletedAt(Instant.now());
    taxFeeRepository.save(entity);
    auditService.log("tax_fee", entity.getId(), "DELETE", null, entity, entity.getPropertyId());
  }

  private void validateProperty(UUID propertyId) {
    if (propertyRepository.findByIdAndDeletedAtIsNull(propertyId).isEmpty()) {
      throw new AppException("PROPERTY_NOT_FOUND", "Property not found", HttpStatus.BAD_REQUEST);
    }
  }

  private void validateAppliesTo(String appliesTo) {
    if (appliesTo == null) {
      return;
    }
    String normalized = appliesTo.trim().toUpperCase();
    if (!ALLOWED_APPLIES_TO.contains(normalized)) {
      throw new AppException("INVALID_APPLIES_TO", "appliesTo must be ROOM, SERVICE, or ALL", HttpStatus.BAD_REQUEST);
    }
  }

  private void apply(TaxFeeEntity entity, TaxFeeRequest request) {
    entity.setPropertyId(request.propertyId());
    entity.setName(request.name());
    entity.setType(request.type());
    entity.setValue(request.value());
    entity.setAppliesTo(request.appliesTo() == null || request.appliesTo().isBlank()
        ? "ALL"
        : request.appliesTo().trim().toUpperCase());
    entity.setActive(request.active() == null || request.active());
  }

  private TaxFeeResponse toResponse(TaxFeeEntity entity) {
    return new TaxFeeResponse(
        entity.getId(),
        entity.getPropertyId(),
        entity.getName(),
        entity.getType(),
        entity.getValue(),
        entity.getAppliesTo(),
        entity.isActive()
    );
  }
}
