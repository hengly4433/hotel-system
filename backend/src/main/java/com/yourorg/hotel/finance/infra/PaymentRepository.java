package com.yourorg.hotel.finance.infra;

import com.yourorg.hotel.finance.domain.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {
  List<PaymentEntity> findAllByFolioIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID folioId);

  boolean existsByIdempotencyKeyAndDeletedAtIsNull(String idempotencyKey);

  @org.springframework.data.jpa.repository.Query("select new com.yourorg.hotel.report.api.dto.RevenueReportResponse(" +
      "cast(p.createdAt as LocalDate), " +
      "cast(p.method as string), " +
      "sum(p.amount), " +
      "count(p)) " +
      "from PaymentEntity p " +
      "where p.deletedAt is null " +
      "and p.createdAt >= :fromDate and p.createdAt < :toDate " +
      "group by cast(p.createdAt as LocalDate), p.method " +
      "order by cast(p.createdAt as LocalDate) desc, p.method asc")
  List<com.yourorg.hotel.report.api.dto.RevenueReportResponse> getRevenueReport(
      @org.springframework.data.repository.query.Param("fromDate") java.time.Instant fromDate,
      @org.springframework.data.repository.query.Param("toDate") java.time.Instant toDate);
}
