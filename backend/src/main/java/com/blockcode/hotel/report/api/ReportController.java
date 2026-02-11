package com.blockcode.hotel.report.api;

import com.blockcode.hotel.report.api.dto.GuestInHouseResponse;
import com.blockcode.hotel.report.api.dto.HousekeepingStatusResponse;
import com.blockcode.hotel.report.api.dto.OccupancyReportResponse;
import com.blockcode.hotel.report.api.dto.PayrollReportResponse;
import com.blockcode.hotel.report.api.dto.RevenueReportResponse;
import com.blockcode.hotel.report.application.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAuthority('report.READ') or hasAuthority('rbac.ADMIN')")
    public List<RevenueReportResponse> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return reportService.getRevenueReport(fromDate, toDate);
    }

    @GetMapping("/occupancy")
    @PreAuthorize("hasAuthority('report.READ') or hasAuthority('rbac.ADMIN')")
    public List<OccupancyReportResponse> getOccupancyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return reportService.getOccupancyReport(fromDate, toDate);
    }

    @GetMapping("/guests-in-house")
    @PreAuthorize("hasAuthority('report.READ') or hasAuthority('rbac.ADMIN')")
    public List<GuestInHouseResponse> getGuestInHouseReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        // Default to today if null
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return reportService.getGuestInHouseReport(targetDate);
    }

    @GetMapping("/arrivals")
    @PreAuthorize("hasAuthority('report.READ') or hasAuthority('rbac.ADMIN')")
    public List<GuestInHouseResponse> getArrivalsReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return reportService.getArrivalsReport(targetDate);
    }

    @GetMapping("/departures")
    @PreAuthorize("hasAuthority('report.READ') or hasAuthority('rbac.ADMIN')")
    public List<GuestInHouseResponse> getDeparturesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return reportService.getDeparturesReport(targetDate);
    }

    @GetMapping("/housekeeping")
    @PreAuthorize("hasAuthority('report.READ') or hasAuthority('rbac.ADMIN')")
    public List<HousekeepingStatusResponse> getHousekeepingReport() {
        return reportService.getHousekeepingReport();
    }

    @GetMapping("/new-bookings")
    @PreAuthorize("hasAuthority('report.READ') or hasAuthority('rbac.ADMIN')")
    public long getNewBookingsCount(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return reportService.getNewBookingsCount(targetDate);
    }

    @GetMapping("/payroll")
    @PreAuthorize("hasAuthority('report.READ') or hasAuthority('rbac.ADMIN')")
    public List<PayrollReportResponse> getPayrollReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return reportService.getPayrollReport(fromDate, toDate);
    }
}
