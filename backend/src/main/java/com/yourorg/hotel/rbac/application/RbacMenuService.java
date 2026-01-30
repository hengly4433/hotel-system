package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.MenuCreateRequest;
import com.yourorg.hotel.rbac.api.dto.MenuResponse;
import com.yourorg.hotel.rbac.api.dto.MenuUpdateRequest;
import com.yourorg.hotel.rbac.api.mapper.MenuMapper;
import com.yourorg.hotel.rbac.domain.RbacMenuEntity;
import com.yourorg.hotel.rbac.infra.RbacMenuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RbacMenuService {
  private final RbacMenuRepository menuRepository;
  private final MenuMapper menuMapper;

  public RbacMenuService(RbacMenuRepository menuRepository, MenuMapper menuMapper) {
    this.menuRepository = menuRepository;
    this.menuMapper = menuMapper;
  }

  public MenuResponse create(MenuCreateRequest request) {
    if (menuRepository.existsByKeyAndDeletedAtIsNull(request.key())) {
      throw new AppException("MENU_EXISTS", "Menu key already exists", HttpStatus.BAD_REQUEST);
    }

    RbacMenuEntity menu = new RbacMenuEntity();
    menu.setKey(request.key());
    menu.setLabel(request.label());
    menu.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());

    menuRepository.save(menu);
    return menuMapper.toResponse(menu);
  }

  @Transactional(readOnly = true)
  public List<MenuResponse> list() {
    return menuRepository.findAllByDeletedAtIsNullOrderBySortOrderAscLabelAsc()
        .stream()
        .map(menuMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public MenuResponse get(UUID id) {
    RbacMenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Menu not found", HttpStatus.NOT_FOUND));
    return menuMapper.toResponse(menu);
  }

  public MenuResponse update(UUID id, MenuUpdateRequest request) {
    RbacMenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Menu not found", HttpStatus.NOT_FOUND));

    menu.setLabel(request.label());
    if (request.sortOrder() != null) {
      menu.setSortOrder(request.sortOrder());
    }

    menuRepository.save(menu);
    return menuMapper.toResponse(menu);
  }

  public void softDelete(UUID id) {
    RbacMenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Menu not found", HttpStatus.NOT_FOUND));
    menu.setDeletedAt(Instant.now());
    menuRepository.save(menu);
  }
}
