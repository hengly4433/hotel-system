package com.yourorg.hotel.employee.api;

import com.yourorg.hotel.employee.api.dto.EmployeeRequest;
import com.yourorg.hotel.employee.api.dto.EmployeeResponse;
import com.yourorg.hotel.employee.application.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
@Validated
public class EmployeeController {
  private final EmployeeService employeeService;

  public EmployeeController(EmployeeService employeeService) {
    this.employeeService = employeeService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('employee.CREATE') or hasAuthority('rbac.ADMIN')")
  public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
    return employeeService.create(request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('employee.READ') or hasAuthority('rbac.ADMIN')")
  public List<EmployeeResponse> list(@RequestParam(required = false) UUID propertyId) {
    return employeeService.list(propertyId);
  }

  @GetMapping("/search")
  @PreAuthorize("hasAuthority('employee.READ') or hasAuthority('rbac.ADMIN')")
  public List<EmployeeResponse> search(@RequestParam String q) {
    return employeeService.search(q);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('employee.READ') or hasAuthority('rbac.ADMIN')")
  public EmployeeResponse get(@PathVariable UUID id) {
    return employeeService.get(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('employee.UPDATE') or hasAuthority('rbac.ADMIN')")
  public EmployeeResponse update(@PathVariable UUID id, @Valid @RequestBody EmployeeRequest request) {
    return employeeService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('employee.DELETE') or hasAuthority('rbac.ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    employeeService.softDelete(id);
    return ResponseEntity.noContent().build();
  }
}
