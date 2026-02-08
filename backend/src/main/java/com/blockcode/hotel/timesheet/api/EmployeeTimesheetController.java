package com.blockcode.hotel.timesheet.api;

import com.blockcode.hotel.timesheet.api.dto.EmployeeTimesheetRequest;
import com.blockcode.hotel.timesheet.api.dto.EmployeeTimesheetResponse;
import com.blockcode.hotel.timesheet.application.EmployeeTimesheetService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/timesheets")
@Validated
public class EmployeeTimesheetController {
  private final EmployeeTimesheetService timesheetService;

  public EmployeeTimesheetController(EmployeeTimesheetService timesheetService) {
    this.timesheetService = timesheetService;
  }

  @GetMapping
  @PreAuthorize("hasAuthority('timesheet.READ') or hasAuthority('rbac.ADMIN')")
  public List<EmployeeTimesheetResponse> list(@RequestParam UUID propertyId) {
    return timesheetService.list(propertyId);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('timesheet.READ') or hasAuthority('rbac.ADMIN')")
  public EmployeeTimesheetResponse get(@PathVariable UUID id) {
    return timesheetService.get(id);
  }

  @PostMapping
  @PreAuthorize("hasAuthority('timesheet.CREATE') or hasAuthority('rbac.ADMIN')")
  public EmployeeTimesheetResponse create(@Valid @RequestBody EmployeeTimesheetRequest request) {
    return timesheetService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('timesheet.UPDATE') or hasAuthority('rbac.ADMIN')")
  public EmployeeTimesheetResponse update(@PathVariable UUID id, @Valid @RequestBody EmployeeTimesheetRequest request) {
    return timesheetService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('timesheet.DELETE') or hasAuthority('rbac.ADMIN')")
  public void delete(@PathVariable UUID id) {
    timesheetService.softDelete(id);
  }
}
