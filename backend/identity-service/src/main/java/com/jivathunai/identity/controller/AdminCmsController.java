package com.jivathunai.identity.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.identity.entity.NewsArticle;
import com.jivathunai.identity.service.CmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/cms")
@RequiredArgsConstructor
public class AdminCmsController {

    private final CmsService cmsService;

    private boolean isSuperAdmin(String rolesHeader) {
        if (rolesHeader != null && (rolesHeader.contains("SUPER_ADMIN") || rolesHeader.contains("ROLE_SUPER_ADMIN"))) {
            return true;
        }
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            return auth.getAuthorities().stream().anyMatch(a -> 
                a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("SUPER_ADMIN")
            );
        }
        return false;
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getAllSettings(
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        if (!isSuperAdmin(roles)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Only Super Admin can manage website content & settings"));
        }
        return ResponseEntity.ok(ApiResponse.success("CMS settings fetched successfully", cmsService.getAllSettings()));
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<?> updateSetting(
            @PathVariable("key") String key,
            @RequestParam(name = "category", required = false) String category,
            @RequestBody Object value,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        if (!isSuperAdmin(roles)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Only Super Admin can modify website content & settings"));
        }
        cmsService.updateSetting(key, value, category);
        return ResponseEntity.ok(ApiResponse.success("Setting '" + key + "' updated successfully", cmsService.getSetting(key)));
    }

    @GetMapping("/news")
    public ResponseEntity<?> getAllNewsForAdmin(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        if (!isSuperAdmin(roles)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Only Super Admin can manage news articles"));
        }
        Page<NewsArticle> articles = cmsService.getAllArticlesForAdmin(category, page, size);
        return ResponseEntity.ok(ApiResponse.success("Articles fetched successfully", articles));
    }

    @PostMapping("/news")
    public ResponseEntity<?> createArticle(
            @RequestBody NewsArticle article,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        if (!isSuperAdmin(roles)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Only Super Admin can create news articles"));
        }
        NewsArticle created = cmsService.createArticle(article);
        return ResponseEntity.ok(ApiResponse.success("Article created successfully", created));
    }

    @PutMapping("/news/{id}")
    public ResponseEntity<?> updateArticle(
            @PathVariable("id") Long id,
            @RequestBody NewsArticle updates,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        if (!isSuperAdmin(roles)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Only Super Admin can modify news articles"));
        }
        try {
            NewsArticle updated = cmsService.updateArticle(id, updates);
            return ResponseEntity.ok(ApiResponse.success("Article updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/news/{id}")
    public ResponseEntity<?> deleteArticle(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        if (!isSuperAdmin(roles)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Only Super Admin can delete news articles"));
        }
        cmsService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }
}
