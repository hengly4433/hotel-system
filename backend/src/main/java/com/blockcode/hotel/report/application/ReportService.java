package com.blockcode.hotel.report.application;
import com.blockcode.hotel.employee.infra.EmployeeRepository;
import com.blockcode.hotel.employee.domain.EmployeeEntity;
import com.blockcode.hotel.report.api.dto.PayrollReportResponse;
import com.blockcode.hotel.timesheet.domain.EmployeeTimesheetEntity;
import com.blockcode.hotel.timesheet.infra.EmployeeTimesheetRepository;

import com.blockcode.hotel.finance.infra.PaymentRepository;
import com.blockcode.hotel.guest.domain.GuestEntity;
import com.blockcode.hotel.guest.domain.PersonEntity;
import com.blockcode.hotel.guest.infra.GuestRepository;
import com.blockcode.hotel.guest.infra.PersonRepository;
import com.blockcode.hotel.housekeeping.infra.HousekeepingTaskRepository;
import com.blockcode.hotel.report.api.dto.GuestInHouseResponse;
import com.blockcode.hotel.report.api.dto.HousekeepingStatusResponse;
import com.blockcode.hotel.report.api.dto.OccupancyReportResponse;
import com.blockcode.hotel.report.api.dto.RevenueReportResponse;
import com.blockcode.hotel.reservation.domain.ReservationEntity;
import com.blockcode.hotel.reservation.domain.ReservationStatus;
import com.blockcode.hotel.reservation.infra.ReservationNightRepository;
import com.blockcode.hotel.reservation.infra.ReservationRepository;
import com.blockcode.hotel.room.domain.RoomEntity;
import com.blockcode.hotel.room.infra.RoomRepository;
import com.blockcode.hotel.room.infra.RoomTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;
    private final ReservationNightRepository reservationNightRepository;
    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final PersonRepository personRepository;
    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final com.blockcode.hotel.reservation.infra.ReservationRoomRepository reservationRoomRepository;
    private final EmployeeTimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;

    public ReportService(PaymentRepository paymentRepository,
            RoomRepository roomRepository,
            ReservationNightRepository reservationNightRepository,
            ReservationRepository reservationRepository,
            GuestRepository guestRepository,
            PersonRepository personRepository,
            HousekeepingTaskRepository housekeepingTaskRepository,
            RoomTypeRepository roomTypeRepository,
            com.blockcode.hotel.reservation.infra.ReservationRoomRepository reservationRoomRepository,
            EmployeeTimesheetRepository timesheetRepository,
            EmployeeRepository employeeRepository) {
        this.paymentRepository = paymentRepository;
        this.roomRepository = roomRepository;
        this.reservationNightRepository = reservationNightRepository;
        this.reservationRepository = reservationRepository;
        this.guestRepository = guestRepository;
        this.personRepository = personRepository;
        this.housekeepingTaskRepository = housekeepingTaskRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.reservationRoomRepository = reservationRoomRepository;
        this.timesheetRepository = timesheetRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<RevenueReportResponse> getRevenueReport(LocalDate fromDate, LocalDate toDate) {
        return paymentRepository.getRevenueReport(
                fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    public List<OccupancyReportResponse> getOccupancyReport(LocalDate fromDate, LocalDate toDate) {
        long totalRooms = roomRepository.countActiveRooms();
        List<OccupancyReportResponse> report = new ArrayList<>();

        for (LocalDate date = fromDate; !date.isAfter(toDate); date = date.plusDays(1)) {
            long occupied = reservationRepository.countActiveReservationsByDate(date);
            double percentage = totalRooms > 0 ? (double) occupied / totalRooms * 100 : 0;
            report.add(new OccupancyReportResponse(date, totalRooms, occupied, percentage));
        }
        return report;
    }

    public List<GuestInHouseResponse> getGuestInHouseReport(LocalDate date) {
        List<ReservationEntity> reservations = reservationRepository
                .findAllByStatusAndDeletedAtIsNull(ReservationStatus.CHECKED_IN);
        // Filter by date overlap if needed, but "In-House" usually means
        // status=CHECKED_IN implies they are there NOW.
        // If 'date' is in the past, we might need historic data which is harder.
        // We will assume 'date' is ignored for "current in-house" or we filter.
        // Let's filter if date is provided.
        if (date != null) {
            reservations = reservations.stream()
                    .filter(r -> !date.isBefore(r.getCheckInDate()) && date.isBefore(r.getCheckOutDate()))
                    .collect(Collectors.toList());
        }

        return reservations.stream().map(this::mapToGuestResponse).collect(Collectors.toList());
    }

    public List<GuestInHouseResponse> getArrivalsReport(LocalDate date) {
        List<ReservationEntity> reservations = reservationRepository.findAllByCheckInDateAndDeletedAtIsNull(date)
                .stream().filter(r -> r.getStatus() == ReservationStatus.CONFIRMED).collect(Collectors.toList());
        return reservations.stream().map(this::mapToGuestResponse).collect(Collectors.toList());
    }

    public List<GuestInHouseResponse> getDeparturesReport(LocalDate date) {
        List<ReservationEntity> reservations = reservationRepository.findAllByCheckOutDateAndDeletedAtIsNull(date)
                .stream().filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN).collect(Collectors.toList());
        return reservations.stream().map(this::mapToGuestResponse).collect(Collectors.toList());
    }

    private GuestInHouseResponse mapToGuestResponse(ReservationEntity r) {
        String guestName = "Unknown";
        try {
            UUID primaryGuestId = r.getPrimaryGuestId();
            if (primaryGuestId != null) {
                GuestEntity guest = guestRepository.findById(primaryGuestId).orElse(null);
                if (guest != null) {
                    UUID personId = guest.getPersonId();
                    if (personId != null) {
                        PersonEntity person = personRepository.findById(personId).orElse(null);
                        if (person != null) {
                            guestName = person.getFirstName() + " " + person.getLastName();
                        }
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }

        String roomNumber = "TBD";
        try {
            List<com.blockcode.hotel.reservation.domain.ReservationRoomEntity> reservationRooms = reservationRoomRepository
                    .findByReservationId(r.getId());
            if (!reservationRooms.isEmpty()) {
                // Assuming one room for now or taking the first one
                UUID roomId = reservationRooms.get(0).getRoomId();
                if (roomId != null) {
                    RoomEntity room = roomRepository.findById(roomId).orElse(null);
                    if (room != null) {
                        roomNumber = room.getRoomNumber();
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }

        return new GuestInHouseResponse(
                r.getId(),
                guestName,
                roomNumber,
                r.getCheckInDate(),
                r.getCheckOutDate(),
                r.getStatus().name());
    }

    public List<HousekeepingStatusResponse> getHousekeepingReport() {
        List<RoomEntity> rooms = roomRepository.findAllByDeletedAtIsNullOrderByRoomNumberAsc();
        var roomTypes = roomTypeRepository.findAll().stream()
                .collect(Collectors.toMap(rt -> rt.getId(), rt -> rt.getName()));

        return rooms.stream().map(room -> {
            String roomTypeName = roomTypes.getOrDefault(room.getRoomTypeId(), "Unknown");
            String status = "UNKNOWN";
            String assignedTo = "Unassigned";

            var task = housekeepingTaskRepository.findTopByRoomIdOrderByTaskDateDesc(room.getId());
            if (task.isPresent()) {
                status = task.get().getStatus().name();
                if (task.get().getAssignedToEmployeeId() != null) {
                    assignedTo = "Assigned";
                }
            } else {
                status = "CLEAN";
            }

            return new HousekeepingStatusResponse(
                    room.getId(),
                    room.getRoomNumber(),
                    roomTypeName,
                    status,
                    assignedTo);
        }).collect(Collectors.toList());
    }

    public long getNewBookingsCount(LocalDate date) {
        return reservationRepository.countReservationsCreatedBetween(
                date.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    public List<PayrollReportResponse> getPayrollReport(LocalDate fromDate, LocalDate toDate) {
        List<EmployeeTimesheetEntity> timesheets = timesheetRepository.findAllByWorkDateBetweenAndDeletedAtIsNull(fromDate, toDate);
        
        // Group by employee
        var timesheetsByEmployee = timesheets.stream()
                .collect(Collectors.groupingBy(EmployeeTimesheetEntity::getEmployeeId));

        List<PayrollReportResponse> report = new ArrayList<>();
        
        // Fetch all employees (could optimize to fetchByIds but findAll is fine for now)
        var employees = employeeRepository.findAll().stream()
                .collect(Collectors.toMap(EmployeeEntity::getId, e -> e));

        for (var entry : timesheetsByEmployee.entrySet()) {
            UUID employeeId = entry.getKey();
            List<EmployeeTimesheetEntity> employeeTimesheets = entry.getValue();
            EmployeeEntity employee = employees.get(employeeId);
            
            if (employee == null) continue;

            // Calculate total minutes
            int totalMinutes = employeeTimesheets.stream()
                    .mapToInt(EmployeeTimesheetEntity::getTotalMinutes)
                    .sum();
            
            // Calculate total pay
            java.math.BigDecimal hourlyRate = employee.getHourlyRate() != null ? employee.getHourlyRate() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal hours = new java.math.BigDecimal(totalMinutes).divide(new java.math.BigDecimal(60), 2, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal totalPay = hours.multiply(hourlyRate).setScale(2, java.math.RoundingMode.HALF_UP);

            String name = "";
            try {
               // Need to fetch Person to get name. Employee has personId.
               // Since we are iterating, N+1 query here. 
               // Optimally we should join, but adapting existing pattern:
               var person = personRepository.findById(employee.getPersonId()).orElse(null);
               if (person != null) {
                   name = person.getFirstName() + " " + person.getLastName();
               }
            } catch (Exception e) {
               name = "Unknown";
            }

            report.add(new PayrollReportResponse(
                employee.getId(),
                name,
                employee.getJobTitle(),
                employee.getDepartment(),
                hourlyRate,
                totalMinutes,
                totalPay
            ));
        }

        return report;
    }
}
