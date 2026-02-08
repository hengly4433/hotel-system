package com.blockcode.hotel.auth.api;

import com.blockcode.hotel.auth.api.dto.MenuTreeResponse;
import com.blockcode.hotel.auth.api.dto.PermissionGroupResponse;
import com.blockcode.hotel.auth.application.PickerService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rbac/pickers")
@PreAuthorize("hasAuthority('rbac.ADMIN')")
public class PickerController {
  private final PickerService pickerService;

  public PickerController(PickerService pickerService) {
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
