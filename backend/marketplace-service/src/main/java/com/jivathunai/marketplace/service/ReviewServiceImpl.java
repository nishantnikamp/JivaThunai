package com.jivathunai.marketplace.service;

import com.jivathunai.marketplace.dto.ReviewDto;
import com.jivathunai.marketplace.entity.Review;
import com.jivathunai.marketplace.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public ReviewDto addReview(ReviewDto reviewDto) {
        Review review = Review.builder()
                .itemId(reviewDto.getItemId())
                .authorName(reviewDto.getAuthorName() != null ? reviewDto.getAuthorName() : "Anonymous")
                .rating(reviewDto.getRating())
                .commentText(reviewDto.getCommentText())
                .build();
        
        Review saved = reviewRepository.save(review);
        return mapToDto(saved);
    }

    @Override
    public List<ReviewDto> getReviewsByItemId(String itemId) {
        return reviewRepository.findByItemIdOrderByCreatedAtDesc(itemId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ReviewDto mapToDto(Review review) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String dateString = review.getCreatedAt() != null ? review.getCreatedAt().format(formatter) : "Just now";
        return ReviewDto.builder()
                .id(review.getId())
                .itemId(review.getItemId())
                .authorName(review.getAuthorName())
                .rating(review.getRating())
                .commentText(review.getCommentText())
                .date(dateString)
                .build();
    }
}
