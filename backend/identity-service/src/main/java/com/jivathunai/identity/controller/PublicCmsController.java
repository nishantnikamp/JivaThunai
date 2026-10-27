package com.jivathunai.identity.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.identity.entity.NewsArticle;
import com.jivathunai.identity.service.CmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/cms")
@RequiredArgsConstructor
public class PublicCmsController {

    private final CmsService cmsService;

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success("Website settings retrieved successfully", cmsService.getAllSettings()));
    }

    @GetMapping("/settings/{key}")
    public ResponseEntity<ApiResponse<Object>> getSetting(@PathVariable("key") String key) {
        Object setting = cmsService.getSetting(key);
        if (setting == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Setting retrieved successfully", setting));
    }

    @GetMapping("/news")
    public ResponseEntity<ApiResponse<Page<NewsArticle>>> getPublishedNews(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "12") int size) {
        Page<NewsArticle> articles = cmsService.getPublishedArticles(category, page, size);
        return ResponseEntity.ok(ApiResponse.success("News articles fetched successfully", articles));
    }

    @GetMapping("/news/{slugOrId}")
    public ResponseEntity<ApiResponse<NewsArticle>> getNewsArticle(@PathVariable("slugOrId") String slugOrId) {
        try {
            NewsArticle article = cmsService.getArticleBySlugOrId(slugOrId, true);
            return ResponseEntity.ok(ApiResponse.success("Article fetched successfully", article));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
