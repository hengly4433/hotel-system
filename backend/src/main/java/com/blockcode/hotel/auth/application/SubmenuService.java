package com.blockcode.hotel.auth.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.auth.api.dto.SubmenuCreateRequest;
import com.blockcode.hotel.auth.api.dto.SubmenuResponse;
import com.blockcode.hotel.auth.api.dto.SubmenuUpdateRequest;
import com.blockcode.hotel.auth.api.mapper.SubmenuMapper;
import com.blockcode.hotel.auth.domain.MenuEntity;
import com.blockcode.hotel.auth.domain.SubmenuEntity;
import com.blockcode.hotel.auth.infra.MenuRepository;
import com.blockcode.hotel.auth.infra.SubmenuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SubmenuService {
  private final SubmenuRepository submenuRepository;
  private final MenuRepository menuRepository;
  private final SubmenuMapper submenuMapper;

  public SubmenuService(
      SubmenuRepository submenuRepository,
      MenuRepository menuRepository,
      SubmenuMapper submenuMapper
  ) {
    this.submenuRepository = submenuRepository;
    this.menuRepository = menuRepository;
    this.submenuMapper = submenuMapper;
  }

  public SubmenuResponse create(SubmenuCreateRequest request) {
    MenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(request.menuId())
        .orElseThrow(() -> new AppException("MENU_NOT_FOUND", "Menu not found", HttpStatus.BAD_REQUEST));

    if (submenuRepository.findByMenuIdAndKeyAndDeletedAtIsNull(menu.getId(), request.key()).isPresent()) {
      throw new AppException("SUBMENU_EXISTS", "Submenu key already exists in menu", HttpStatus.BAD_REQUEST);
    }

    SubmenuEntity submenu = new SubmenuEntity();
    submenu.setMenuId(menu.getId());
    submenu.setKey(request.key());
    submenu.setLabel(request.label());
    submenu.setRoute(request.route());
    submenu.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());

    submenuRepository.save(submenu);
    return submenuMapper.toResponse(submenu);
  }

  @Transactional(readOnly = true)
  public List<SubmenuResponse> list() {
    return submenuRepository.findAllByDeletedAtIsNullOrderByMenuIdAscSortOrderAsc()
        .stream()
        .map(submenuMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public SubmenuResponse get(UUID id) {
    SubmenuEntity submenu = submenuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Submenu not found", HttpStatus.NOT_FOUND));
    return submenuMapper.toResponse(submenu);
  }

  public SubmenuResponse update(UUID id, SubmenuUpdateRequest request) {
    SubmenuEntity submenu = submenuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Submenu not found", HttpStatus.NOT_FOUND));

    UUID menuId = submenu.getMenuId();
    boolean menuChanged = false;
    if (request.menuId() != null && !request.menuId().equals(menuId)) {
      MenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(request.menuId())
          .orElseThrow(() -> new AppException("MENU_NOT_FOUND", "Menu not found", HttpStatus.BAD_REQUEST));
      menuId = menu.getId();
      submenu.setMenuId(menuId);
      menuChanged = true;
    }

    if (request.key() != null || menuChanged) {
      String keyToCheck = request.key() != null ? request.key() : submenu.getKey();
      submenuRepository.findByMenuIdAndKeyAndDeletedAtIsNull(menuId, keyToCheck)
          .filter(existing -> !existing.getId().equals(submenu.getId()))
          .ifPresent(existing -> {
            throw new AppException("SUBMENU_EXISTS", "Submenu key already exists in menu", HttpStatus.BAD_REQUEST);
          });
    }

    if (request.key() != null) {
      submenu.setKey(request.key());
    }
    if (request.label() != null) {
      submenu.setLabel(request.label());
    }
    if (request.route() != null) {
      submenu.setRoute(request.route());
    }
    if (request.sortOrder() != null) {
      submenu.setSortOrder(request.sortOrder());
    }

    submenuRepository.save(submenu);
    return submenuMapper.toResponse(submenu);
  }

  public void softDelete(UUID id) {
    SubmenuEntity submenu = submenuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Submenu not found", HttpStatus.NOT_FOUND));
    submenu.setDeletedAt(Instant.now());
    submenuRepository.save(submenu);
  }
}
