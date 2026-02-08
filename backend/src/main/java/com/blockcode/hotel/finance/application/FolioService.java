package com.blockcode.hotel.finance.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.common.security.CurrentUserProvider;
import com.blockcode.hotel.finance.api.dto.FolioDetailResponse;
import com.blockcode.hotel.finance.api.dto.FolioItemCreateRequest;
import com.blockcode.hotel.finance.api.dto.FolioItemResponse;
import com.blockcode.hotel.finance.api.dto.FolioSummaryResponse;
import com.blockcode.hotel.finance.api.dto.PaymentCreateRequest;
import com.blockcode.hotel.finance.api.dto.PaymentResponse;
import com.blockcode.hotel.finance.domain.FolioEntity;
import com.blockcode.hotel.finance.domain.FolioItemEntity;
import com.blockcode.hotel.finance.domain.FolioItemType;
import com.blockcode.hotel.finance.domain.FolioStatus;
import com.blockcode.hotel.finance.domain.PaymentEntity;
import com.blockcode.hotel.finance.domain.PaymentStatus;
import com.blockcode.hotel.finance.infra.FolioItemRepository;
import com.blockcode.hotel.finance.infra.FolioRepository;
import com.blockcode.hotel.finance.infra.PaymentRepository;
import com.blockcode.hotel.pricing.domain.TaxFeeEntity;
import com.blockcode.hotel.pricing.domain.TaxFeeType;
import com.blockcode.hotel.pricing.infra.TaxFeeRepository;
import com.blockcode.hotel.reservation.application.NightlyCharge;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FolioService {
  private final FolioRepository folioRepository;
  private final FolioItemRepository folioItemRepository;
  private final PaymentRepository paymentRepository;
  private final TaxFeeRepository taxFeeRepository;
  private final CurrentUserProvider currentUserProvider;

  public FolioService(
      FolioRepository folioRepository,
      FolioItemRepository folioItemRepository,
      PaymentRepository paymentRepository,
      TaxFeeRepository taxFeeRepository,
      CurrentUserProvider currentUserProvider) {
    this.folioRepository = folioRepository;
    this.folioItemRepository = folioItemRepository;
    this.paymentRepository = paymentRepository;
    this.taxFeeRepository = taxFeeRepository;
    this.currentUserProvider = currentUserProvider;
  }

  @Transactional(readOnly = true)
  public List<FolioSummaryResponse> list() {
    return folioRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
        .stream()
        .map(this::toSummary)
        .toList();
  }

  @Transactional(readOnly = true)
  public FolioDetailResponse get(UUID id) {
    FolioEntity folio = getActiveFolio(id);
    return toDetail(folio);
  }

  public FolioItemResponse addItem(UUID folioId, FolioItemCreateRequest request) {
    FolioEntity folio = getOpenFolio(folioId);

    BigDecimal qty = normalizeQty(request.qty());
    BigDecimal unitPrice = normalizeMoney(request.unitPrice());
    if (qty.signum() < 0 || unitPrice.signum() < 0) {
      throw new AppException("INVALID_AMOUNT", "Amounts must be positive", HttpStatus.BAD_REQUEST);
    }

    BigDecimal amount = unitPrice.multiply(qty).setScale(2, RoundingMode.HALF_UP);

    FolioItemEntity item = new FolioItemEntity();
    item.setFolioId(folio.getId());
    item.setType(request.type());
    item.setDescription(request.description());
    item.setQty(qty);
    item.setUnitPrice(unitPrice);
    item.setAmount(amount);
    item.setPostedAt(Instant.now());
    item.setPostedBy(currentUserProvider.getCurrentUserId().orElse(null));

    folioItemRepository.save(item);
    return toResponse(item);
  }

  public PaymentResponse addPayment(UUID folioId, PaymentCreateRequest request) {
    FolioEntity folio = getOpenFolio(folioId);

    BigDecimal amount = normalizeMoney(request.amount());
    if (amount.signum() < 0) {
      throw new AppException("INVALID_AMOUNT", "Amount must be positive", HttpStatus.BAD_REQUEST);
    }

    String currency = request.currency();
    if (currency == null || currency.isBlank()) {
      currency = folio.getCurrency();
    }

    String idempotencyKey = request.idempotencyKey();
    if (idempotencyKey == null || idempotencyKey.isBlank()) {
      idempotencyKey = "manual-" + UUID.randomUUID();
    }

    if (paymentRepository.existsByIdempotencyKeyAndDeletedAtIsNull(idempotencyKey)) {
      throw new AppException("PAYMENT_DUPLICATE", "Duplicate payment idempotency key", HttpStatus.CONFLICT);
    }

    PaymentEntity payment = new PaymentEntity();
    payment.setFolioId(folio.getId());
    payment.setMethod(request.method());
    payment.setAmount(amount);
    payment.setCurrency(currency);
    payment.setStatus(request.status() == null ? PaymentStatus.AUTHORIZED : request.status());
    payment.setProvider(request.provider());
    payment.setProviderRef(request.providerRef());
    payment.setIdempotencyKey(idempotencyKey);
    payment.setCreatedBy(currentUserProvider.getCurrentUserId().orElse(null));

    paymentRepository.save(payment);
    return toResponse(payment);
  }

  public FolioDetailResponse close(UUID folioId) {
    FolioEntity folio = getActiveFolio(folioId);
    if (folio.getStatus() != FolioStatus.CLOSED) {
      folio.setStatus(FolioStatus.CLOSED);
      folioRepository.save(folio);
    }
    return toDetail(folio);
  }

  public void postReservationCharges(UUID reservationId, UUID propertyId, List<NightlyCharge> nightlyCharges) {
    if (reservationId == null || propertyId == null || nightlyCharges == null || nightlyCharges.isEmpty()) {
      return;
    }

    FolioEntity folio = folioRepository.findByReservationIdAndDeletedAtIsNull(reservationId)
        .orElseThrow(() -> new AppException("FOLIO_NOT_FOUND", "Folio not found", HttpStatus.NOT_FOUND));
    if (folio.getStatus() != FolioStatus.OPEN) {
      throw new AppException("FOLIO_CLOSED", "Folio is not open", HttpStatus.CONFLICT);
    }

    BigDecimal roomTotal = BigDecimal.ZERO;
    for (NightlyCharge charge : nightlyCharges) {
      BigDecimal unitPrice = normalizeMoney(charge.price());
      FolioItemEntity item = new FolioItemEntity();
      item.setFolioId(folio.getId());
      item.setType(FolioItemType.ROOM_CHARGE);
      item.setDescription("Room charge - " + charge.date());
      item.setQty(BigDecimal.ONE);
      item.setUnitPrice(unitPrice);
      item.setAmount(unitPrice);
      item.setPostedAt(Instant.now());
      item.setPostedBy(null);
      folioItemRepository.save(item);
      roomTotal = roomTotal.add(unitPrice);
    }

    if (roomTotal.signum() == 0) {
      return;
    }

    List<TaxFeeEntity> taxes = taxFeeRepository.findAllByPropertyIdAndActiveTrueAndDeletedAtIsNull(propertyId);
    int nightsCount = nightlyCharges.size();
    for (TaxFeeEntity taxFee : taxes) {
      String appliesTo = taxFee.getAppliesTo() == null ? "ALL" : taxFee.getAppliesTo();
      if (!"ROOM".equalsIgnoreCase(appliesTo) && !"ALL".equalsIgnoreCase(appliesTo)) {
        continue;
      }

      BigDecimal amount;
      BigDecimal qty;
      BigDecimal unitPrice;
      FolioItemType type = taxFee.getType() == TaxFeeType.PERCENT ? FolioItemType.TAX : FolioItemType.FEE;

      if (taxFee.getType() == TaxFeeType.PERCENT) {
        BigDecimal rate = taxFee.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
        amount = roomTotal.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        qty = BigDecimal.ONE;
        unitPrice = amount;
      } else {
        qty = BigDecimal.valueOf(nightsCount);
        unitPrice = normalizeMoney(taxFee.getValue());
        amount = unitPrice.multiply(qty).setScale(2, RoundingMode.HALF_UP);
      }

      if (amount.signum() <= 0) {
        continue;
      }

      FolioItemEntity item = new FolioItemEntity();
      item.setFolioId(folio.getId());
      item.setType(type);
      item.setDescription(taxFee.getName());
      item.setQty(qty);
      item.setUnitPrice(unitPrice);
      item.setAmount(amount);
      item.setPostedAt(Instant.now());
      item.setPostedBy(null);
      folioItemRepository.save(item);
    }
  }

  private FolioEntity getActiveFolio(UUID id) {
    return folioRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Folio not found", HttpStatus.NOT_FOUND));
  }

  private FolioEntity getOpenFolio(UUID id) {
    FolioEntity folio = getActiveFolio(id);
    if (folio.getStatus() != FolioStatus.OPEN) {
      throw new AppException("FOLIO_CLOSED", "Folio is not open", HttpStatus.CONFLICT);
    }
    return folio;
  }

  private FolioSummaryResponse toSummary(FolioEntity entity) {
    return new FolioSummaryResponse(
        entity.getId(),
        entity.getReservationId(),
        entity.getStatus(),
        entity.getCurrency());
  }

  private FolioDetailResponse toDetail(FolioEntity entity) {
    List<FolioItemEntity> items = folioItemRepository
        .findAllByFolioIdAndDeletedAtIsNullOrderByPostedAtDesc(entity.getId());
    List<PaymentEntity> payments = paymentRepository
        .findAllByFolioIdAndDeletedAtIsNullOrderByCreatedAtDesc(entity.getId());

    List<FolioItemResponse> itemResponses = items.stream()
        .map(this::toResponse)
        .toList();

    List<PaymentResponse> paymentResponses = payments.stream()
        .map(this::toResponse)
        .toList();

    BigDecimal totalCharges = items.stream()
        .map(FolioItemEntity::getAmount)
        .filter(amount -> amount != null)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal totalPayments = payments.stream()
        .filter(payment -> isAppliedPayment(payment.getStatus()))
        .map(PaymentEntity::getAmount)
        .filter(amount -> amount != null)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal balance = totalCharges.subtract(totalPayments);

    return new FolioDetailResponse(
        entity.getId(),
        entity.getReservationId(),
        entity.getStatus(),
        entity.getCurrency(),
        itemResponses,
        paymentResponses,
        totalCharges,
        totalPayments,
        balance);
  }

  private FolioItemResponse toResponse(FolioItemEntity item) {
    return new FolioItemResponse(
        item.getId(),
        item.getFolioId(),
        item.getType(),
        item.getDescription(),
        item.getQty(),
        item.getUnitPrice(),
        item.getAmount(),
        item.getPostedAt(),
        item.getPostedBy());
  }

  private PaymentResponse toResponse(PaymentEntity payment) {
    return new PaymentResponse(
        payment.getId(),
        payment.getFolioId(),
        payment.getMethod(),
        payment.getAmount(),
        payment.getCurrency(),
        payment.getStatus(),
        payment.getProvider(),
        payment.getProviderRef(),
        payment.getIdempotencyKey(),
        payment.getCreatedBy(),
        payment.getCreatedAt());
  }

  private boolean isAppliedPayment(PaymentStatus status) {
    return status == PaymentStatus.CAPTURED || status == PaymentStatus.AUTHORIZED;
  }

  private BigDecimal normalizeMoney(BigDecimal value) {
    if (value == null) {
      return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
    return value.setScale(2, RoundingMode.HALF_UP);
  }

  private BigDecimal normalizeQty(BigDecimal value) {
    if (value == null) {
      return BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
    }
    return value.setScale(4, RoundingMode.HALF_UP);
  }
}
