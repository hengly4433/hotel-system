package com.yourorg.hotel.rbac.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.rbac.api.dto.SubmenuCreateRequest;
import com.yourorg.hotel.rbac.api.dto.SubmenuResponse;
import com.yourorg.hotel.rbac.api.dto.SubmenuUpdateRequest;
import com.yourorg.hotel.rbac.api.mapper.SubmenuMapper;
import com.yourorg.hotel.rbac.domain.RbacMenuEntity;
import com.yourorg.hotel.rbac.domain.RbacSubmenuEntity;
import com.yourorg.hotel.rbac.infra.RbacMenuRepository;
import com.yourorg.hotel.rbac.infra.RbacSubmenuRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RbacSubmenuService {
  private final RbacSubmenuRepository submenuRepository;
  private final RbacMenuRepository menuRepository;
  private final SubmenuMapper submenuMapper;

  public RbacSubmenuService(
      RbacSubmenuRepository submenuRepository,
      RbacMenuRepository menuRepository,
      SubmenuMapper submenuMapper
  ) {
    this.submenuRepository = submenuRepository;
    this.menuRepository = menuRepository;
    this.submenuMapper = submenuMapper;
  }

  public SubmenuResponse create(SubmenuCreateRequest request) {
    RbacMenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(request.menuId())
        .orElseThrow(() -> new AppException("MENU_NOT_FOUND", "Menu not found", HttpStatus.BAD_REQUEST));

    if (submenuRepository.findByMenuIdAndKeyAndDeletedAtIsNull(menu.getId(), request.key()).isPresent()) {
      throw new AppException("SUBMENU_EXISTS", "Submenu key already exists in menu", HttpStatus.BAD_REQUEST);
    }

    RbacSubmenuEntity submenu = new RbacSubmenuEntity();
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
    RbacSubmenuEntity submenu = submenuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Submenu not found", HttpStatus.NOT_FOUND));
    return submenuMapper.toResponse(submenu);
  }

  public SubmenuResponse update(UUID id, SubmenuUpdateRequest request) {
    RbacSubmenuEntity submenu = submenuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Submenu not found", HttpStatus.NOT_FOUND));

    UUID menuId = submenu.getMenuId();
    boolean menuChanged = false;
    if (request.menuId() != null && !request.menuId().equals(menuId)) {
      RbacMenuEntity menu = menuRepository.findByIdAndDeletedAtIsNull(request.menuId())
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
    RbacSubmenuEntity submenu = submenuRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Submenu not found", HttpStatus.NOT_FOUND));
    submenu.setDeletedAt(Instant.now());
    submenuRepository.save(submenu);
  }
}
