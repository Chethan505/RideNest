package com.vehiclerental.backend.service;

import com.vehiclerental.backend.dto.AverageRatingResponse;
import com.vehiclerental.backend.dto.ReviewRequest;
import com.vehiclerental.backend.dto.ReviewResponse;
import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.model.Review;
import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.repository.BookingRepository;
import com.vehiclerental.backend.repository.CarRepository;
import com.vehiclerental.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            CarRepository carRepository) {

        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
    }

  public Review createReview(User loggedInUser, ReviewRequest request) {

    Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new RuntimeException("Booking not found"));

    // Booking must belong to the logged-in user
    if (!booking.getUser().getId().equals(loggedInUser.getId())) {
        throw new RuntimeException("You cannot review this booking.");
    }

    // Booking must be completed
    if (!"COMPLETED".equalsIgnoreCase(booking.getStatus())) {
        throw new RuntimeException("Only completed bookings can be reviewed.");
    }

    // Check whether this booking already has a review
    boolean alreadyReviewed =
            reviewRepository.findByBooking(booking).isPresent();

    System.out.println(
            "CREATE REVIEW CHECK -> Booking ID: "
                    + booking.getId()
                    + " | Already reviewed: "
                    + alreadyReviewed
    );

    if (alreadyReviewed) {
        throw new RuntimeException("You have already reviewed this booking.");
    }

    Review review = new Review();
    review.setBooking(booking);
    review.setUser(loggedInUser);
    review.setCar(booking.getCar());
    review.setRating(request.getRating());
    review.setComment(request.getComment());

    try {

        return reviewRepository.saveAndFlush(review);

    } catch (org.springframework.dao.DataIntegrityViolationException e) {

        System.out.println("DATABASE ERROR:");
        e.printStackTrace();

        throw new RuntimeException(
                "Failed to save review: " + e.getMostSpecificCause().getMessage()
        );
    }
}

    public List<ReviewResponse> getReviewsByCar(Long carId) {

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        List<Review> reviews = reviewRepository.findByCarOrderByCreatedAtDesc(car);

        return reviews.stream().map(review -> {

            ReviewResponse response = new ReviewResponse();

            response.setId(review.getId());
            response.setUserId(review.getUser().getId());
            response.setUserName(review.getUser().getName());
            response.setRating(review.getRating());
            response.setComment(review.getComment());
            response.setCreatedAt(review.getCreatedAt());

            return response;

        }).toList();
    }

    public AverageRatingResponse getAverageRating(Long carId) {

        Double average = reviewRepository.getAverageRating(carId);

        if (average == null) {
            average = 0.0;
        }

        Long totalReviews = reviewRepository.countByCarId(carId);

        return new AverageRatingResponse(average, totalReviews);
    }

 public boolean hasReviewed(Long bookingId) {

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() ->
                    new RuntimeException("Booking not found"));

    return reviewRepository.findByBooking(booking).isPresent();
}
}