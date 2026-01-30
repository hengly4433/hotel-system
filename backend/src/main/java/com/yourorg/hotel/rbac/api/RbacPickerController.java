package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.api.dto.MenuTreeResponse;
import com.yourorg.hotel.rbac.api.dto.PermissionGroupResponse;
import com.yourorg.hotel.rbac.application.RbacPickerService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rbac/pickers")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
public class RbacPickerController {
  private final RbacPickerService pickerService;

  public RbacPickerController(RbacPickerService pickerService) {
    this.pickerService = pickerService;
  }

  @GetMapping("/permissions-grouped")
  public List<PermissionGroupResponse> permissionsGrouped() {
    return pickerService.getPermissionsGrouped();
  }

  @GetMapping("/menu-tree")
  public List<MenuTreeResponse> menuTree() {
    return pickerService.getMenuTree();
  }
}
