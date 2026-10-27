package com.jivathunai.marketplace.service;

import com.jivathunai.marketplace.dto.ReviewDto;
import java.util.List;

public interface ReviewService {
    ReviewDto addReview(ReviewDto reviewDto);
    List<ReviewDto> getReviewsByItemId(String itemId);
}
