package com.blockcode.hotel.housekeeping.api;

import com.blockcode.hotel.housekeeping.api.dto.HousekeepingBoardRowResponse;
import com.blockcode.hotel.housekeeping.api.dto.HousekeepingTaskEventResponse;
import com.blockcode.hotel.housekeeping.api.dto.HousekeepingTaskRequest;
import com.blockcode.hotel.housekeeping.api.dto.HousekeepingTaskResponse;
import com.blockcode.hotel.housekeeping.application.HousekeepingTaskService;
import com.blockcode.hotel.housekeeping.domain.WorkShift;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/housekeeping")
@Validated
public class HousekeepingTaskController {
  private final HousekeepingTaskService taskService;

  public HousekeepingTaskController(HousekeepingTaskService taskService) {
    this.taskService = taskService;
  }

  @PostMapping("/tasks")
  @PreAuthorize("hasAuthority('housekeeping.CREATE') or hasAuthority('rbac.ADMIN')")
  public HousekeepingTaskResponse create(@Valid @RequestBody HousekeepingTaskRequest request) {
    return taskService.create(request);
  }

  @GetMapping("/tasks")
  @PreAuthorize("hasAuthority('housekeeping.READ') or hasAuthority('rbac.ADMIN')")
  public List<HousekeepingTaskResponse> list(@RequestParam(required = false) UUID propertyId) {
    return taskService.list(propertyId);
  }

  @GetMapping("/tasks/{id}")
  @PreAuthorize("hasAuthority('housekeeping.READ') or hasAuthority('rbac.ADMIN')")
  public HousekeepingTaskResponse get(@PathVariable UUID id) {
    return taskService.get(id);
  }

  @GetMapping("/tasks/{id}/events")
  @PreAuthorize("hasAuthority('housekeeping.READ') or hasAuthority('rbac.ADMIN')")
  public List<HousekeepingTaskEventResponse> events(@PathVariable UUID id) {
    return taskService.events(id);
  }

  @GetMapping("/board")
  @PreAuthorize("hasAuthority('housekeeping.READ') or hasAuthority('rbac.ADMIN')")
  public List<HousekeepingBoardRowResponse> board(
      @RequestParam UUID propertyId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @RequestParam(required = false) WorkShift shift
  ) {
    return taskService.board(propertyId, date, shift);
  }

  @PutMapping("/tasks/{id}")
  @PreAuthorize("hasAuthority('housekeeping.UPDATE') or hasAuthority('rbac.ADMIN')")
  public HousekeepingTaskResponse update(@PathVariable UUID id, @Valid @RequestBody HousekeepingTaskRequest request) {
    return taskService.update(id, request);
  }

  @DeleteMapping("/tasks/{id}")
  @PreAuthorize("hasAuthority('housekeeping.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    taskService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
