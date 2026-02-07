package com.blockcode.hotel.content.api;

import com.blockcode.hotel.content.api.dto.PageContentRequest;
import com.blockcode.hotel.content.api.dto.PageContentResponse;
import com.blockcode.hotel.content.application.PageContentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
public class PageContentController {
    private final PageContentService pageContentService;

    public PageContentController(PageContentService pageContentService) {
        this.pageContentService = pageContentService;
    }

    @GetMapping("/api/public/page-contents")
    public List<PageContentResponse> listPublic() {
        return pageContentService.list();
    }

    @GetMapping("/api/v1/page-contents")
    @PreAuthorize("hasAuthority('content.READ') or hasAuthority('rbac.ADMIN')")
    public List<PageContentResponse> listAdmin() {
        return pageContentService.list();
    }

    @GetMapping("/api/v1/page-contents/{id}")
    @PreAuthorize("hasAuthority('content.READ') or hasAuthority('rbac.ADMIN')")
    public PageContentResponse get(@PathVariable UUID id) {
        return pageContentService.get(id);
    }

    @PostMapping("/api/v1/page-contents")
    @PreAuthorize("hasAuthority('content.CREATE') or hasAuthority('rbac.ADMIN')")
    public PageContentResponse create(@Valid @RequestBody PageContentRequest request) {
        return pageContentService.create(request);
    }

    @PutMapping("/api/v1/page-contents/{id}")
    @PreAuthorize("hasAuthority('content.UPDATE') or hasAuthority('rbac.ADMIN')")
    public PageContentResponse update(@PathVariable UUID id, @Valid @RequestBody PageContentRequest request) {
        return pageContentService.update(id, request);
    }
}
