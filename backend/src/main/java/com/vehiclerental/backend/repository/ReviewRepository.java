package com.vehiclerental.backend.repository;

import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByBooking(Booking booking);

    

    List<Review> findByCarOrderByCreatedAtDesc(Car car);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.car.id = :carId")
    Double getAverageRating(Long carId);

    Long countByCarId(Long carId);
} 