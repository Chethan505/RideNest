package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.dto.AverageRatingResponse;
import com.vehiclerental.backend.dto.ReviewRequest;
import com.vehiclerental.backend.dto.ReviewResponse;
import com.vehiclerental.backend.model.Review;
import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.repository.ReviewRepository;
import com.vehiclerental.backend.service.ReviewService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    public ReviewController(
            ReviewService reviewService,
            ReviewRepository reviewRepository) {

        this.reviewService = reviewService;
        this.reviewRepository = reviewRepository;
    }


    // ─────────────────────────────────────────────
    // CREATE REVIEW
    // ─────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request) {

        try {

            if (authentication == null ||
                    !authentication.isAuthenticated()) {

                return ResponseEntity.status(401)
                        .body(java.util.Map.of(
                                "error",
                                "Unauthorized – please login again."
                        ));
            }

            User user = (User) authentication.getPrincipal();

            Review review = reviewService.createReview(
                    user,
                    request
            );

            return ResponseEntity.ok(review);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(java.util.Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }


    // ─────────────────────────────────────────────
    // GET REVIEWS FOR A CAR
    // ─────────────────────────────────────────────

    @GetMapping("/car/{carId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByCar(
            @PathVariable Long carId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByCar(carId)
        );
    }


    // ─────────────────────────────────────────────
    // GET AVERAGE RATING
    // ─────────────────────────────────────────────

    @GetMapping("/car/{carId}/average")
    public ResponseEntity<AverageRatingResponse> getAverageRating(
            @PathVariable Long carId) {

        return ResponseEntity.ok(
                reviewService.getAverageRating(carId)
        );
    }


    // ─────────────────────────────────────────────
    // CHECK IF BOOKING IS ALREADY REVIEWED
    // ─────────────────────────────────────────────

    @GetMapping("/booking/{bookingId}/exists")
    public ResponseEntity<Boolean> hasReviewed(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                reviewService.hasReviewed(bookingId)
        );
    }


    // ─────────────────────────────────────────────
    // TEMPORARY DEBUG ENDPOINT
    // ─────────────────────────────────────────────

  @GetMapping("/debug")
public ResponseEntity<?> debugReviews() {

    return ResponseEntity.ok(
            reviewRepository.findAll()
                    .stream()
                    .map(review -> java.util.Map.of(
                            "reviewId", review.getId(),
                            "bookingId", review.getBooking().getId(),
                            "carId", review.getCar().getId(),
                            "rating", review.getRating(),
                            "comment", review.getComment()
                    ))
                    .toList()
    );
}
}