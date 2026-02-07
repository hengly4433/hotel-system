package com.blockcode.hotel.auth.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.auth.api.dto.MenuCreateRequest;
import com.blockcode.hotel.auth.api.dto.MenuResponse;
import com.blockcode.hotel.auth.api.dto.MenuUpdateRequest;
import com.blockcode.hotel.auth.api.mapper.MenuMapper;
import com.blockcode.hotel.auth.domain.MenuEntity;
import com.blockcode.hotel.auth.infra.MenuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MenuService {
  private final MenuRepository menuRepository;
  private final MenuMapper menuMapper;

  public MenuService(MenuRepository menuRepository, MenuMapper menuMapper) {
    this.menuRepository = menuRepository;
    this.menuMapper = menuMapper;
  }

  public MenuResponse create(MenuCreateRequest request) {
    if (menuRepository.existsByKeyAndDeletedAtIsNull(request.key())) {
      throw new AppException("MENU_EXISTS", "Menu key already exists", HttpStatus.BAD_REQUEST);
    }

    MenuEntity menu = new MenuEntity();
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
    MenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Menu not found", HttpStatus.NOT_FOUND));
    return menuMapper.toResponse(menu);
  }

  public MenuResponse update(UUID id, MenuUpdateRequest request) {
    MenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Menu not found", HttpStatus.NOT_FOUND));

    menu.setLabel(request.label());
    if (request.sortOrder() != null) {
      menu.setSortOrder(request.sortOrder());
    }

    menuRepository.save(menu);
    return menuMapper.toResponse(menu);
  }

  public void softDelete(UUID id) {
    MenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Menu not found", HttpStatus.NOT_FOUND));
    menu.setDeletedAt(Instant.now());
    menuRepository.save(menu);
  }
}
