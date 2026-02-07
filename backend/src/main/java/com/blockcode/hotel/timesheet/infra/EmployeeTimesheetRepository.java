package com.blockcode.hotel.timesheet.infra;

import com.blockcode.hotel.timesheet.domain.EmployeeTimesheetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.blockcode.hotel.housekeeping.domain.WorkShift;

public interface EmployeeTimesheetRepository extends JpaRepository<EmployeeTimesheetEntity, UUID> {
  Optional<EmployeeTimesheetEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<EmployeeTimesheetEntity> findAllByPropertyIdAndDeletedAtIsNullOrderByWorkDateDesc(UUID propertyId);

  boolean existsByEmployeeIdAndWorkDateAndShiftAndDeletedAtIsNull(UUID employeeId, LocalDate workDate, WorkShift shift);
}
