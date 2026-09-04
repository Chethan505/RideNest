package com.vehiclerental.backend.repository;

import com.vehiclerental.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query(value = "SELECT b FROM Booking b LEFT JOIN FETCH b.user LEFT JOIN FETCH b.car",
           countQuery = "SELECT count(b) FROM Booking b")
    Page<Booking> findAllWithDetails(Pageable pageable);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Page<Booking> findByCarId(Long carId, Pageable pageable);

    List<Booking> findByStatus(String status);

    boolean existsByUserIdAndCarId(Long userId, Long carId);

    /**
     * Check for overlapping bookings on the same car.
     * Two date ranges [A, B] and [C, D] overlap when A <= D AND B >= C.
     * Only active bookings (BOOKED) count — cancelled ones don't block.
     */
    @Query("SELECT b FROM Booking b WHERE b.car.id = :carId " +
       "AND b.status IN ('BOOKED', 'ACTIVE', 'AWAITING_VERIFICATION') " +
       "AND b.startDate <= :endDate " +
       "AND b.endDate >= :startDate")
List<Booking> findOverlappingBookings(
        @Param("carId") Long carId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
);

   @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.car.id = :carId " +
       "AND b.status = 'ACTIVE' " +
       "AND :currentDate BETWEEN b.startDate AND b.endDate")
List<Booking> findActiveBookingByUserAndCar(@Param("userId") Long userId,
                                            @Param("carId") Long carId,
                                            @Param("currentDate") LocalDate currentDate);
}
