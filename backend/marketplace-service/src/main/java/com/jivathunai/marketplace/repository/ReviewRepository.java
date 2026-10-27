package com.jivathunai.marketplace.repository;

import com.jivathunai.marketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByItemIdOrderByCreatedAtDesc(String itemId);
}
