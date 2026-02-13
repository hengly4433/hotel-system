package com.blockcode.hotel.blog.api;

import com.blockcode.hotel.blog.api.dto.BlogRequest;
import com.blockcode.hotel.blog.api.dto.BlogResponse;
import com.blockcode.hotel.blog.application.BlogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
public class BlogController {
    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping("/api/v1/public/blogs")
    public List<BlogResponse> listPublic() {
        return blogService.listPublic();
    }

    @GetMapping("/api/v1/blogs")
    @PreAuthorize("hasAuthority('blog.READ') or hasAuthority('rbac.ADMIN')")
    public List<BlogResponse> listAdmin() {
        return blogService.listAdmin();
    }

    @GetMapping("/api/v1/blogs/{id}")
    @PreAuthorize("hasAuthority('blog.READ') or hasAuthority('rbac.ADMIN')")
    public BlogResponse get(@PathVariable UUID id) {
        return blogService.get(id);
    }

    @PostMapping("/api/v1/blogs")
    @PreAuthorize("hasAuthority('blog.CREATE') or hasAuthority('rbac.ADMIN')")
    public BlogResponse create(@Valid @RequestBody BlogRequest request) {
        return blogService.create(request);
    }

    @PutMapping("/api/v1/blogs/{id}")
    @PreAuthorize("hasAuthority('blog.UPDATE') or hasAuthority('rbac.ADMIN')")
    public BlogResponse update(@PathVariable UUID id, @Valid @RequestBody BlogRequest request) {
        return blogService.update(id, request);
    }

    @DeleteMapping("/api/v1/blogs/{id}")
    @PreAuthorize("hasAuthority('blog.DELETE') or hasAuthority('rbac.ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        blogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
