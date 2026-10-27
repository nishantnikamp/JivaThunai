package com.jivathunai.identity.repository;

import com.jivathunai.identity.entity.NewsArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {
    Optional<NewsArticle> findBySlug(String slug);
    Page<NewsArticle> findByPublishedTrueOrderByPublishedAtDesc(Pageable pageable);
    Page<NewsArticle> findByCategoryAndPublishedTrueOrderByPublishedAtDesc(String category, Pageable pageable);
    Page<NewsArticle> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<NewsArticle> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);
}
