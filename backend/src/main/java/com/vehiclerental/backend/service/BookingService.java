package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.repository.BookingRepository;
import com.vehiclerental.backend.repository.CarRepository;
import com.vehiclerental.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    // ─── Book a car ─────────────────────────────────────────────────────

    @Transactional
    public Booking bookCar(Booking booking) {
        Long carId = booking.getCar().getId();
        Long userId = booking.getUser().getId();

        // Validate user exists & set full reference
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!"APPROVED".equals(user.getVerificationStatus())) {
        throw new RuntimeException("Your driving license must be approved before booking a car.");
}
        booking.setUser(user);


        // Validate car exists and lock it
        Car car = carRepository.findByIdForUpdate(carId)
                .orElseThrow(() -> new RuntimeException("Car not found with id: " + carId));

        // Validate car is available
        if (!car.isAvailable()) {
            throw new RuntimeException("Car is not available for booking");
        }

        // Validate dates
        if (booking.getStartDate() == null || booking.getEndDate() == null) {
            throw new RuntimeException("Start date and end date are required");
        }
        if (booking.getEndDate().isBefore(booking.getStartDate()) || booking.getEndDate().isEqual(booking.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        if (booking.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }

        // Check for overlapping bookings
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                carId, booking.getStartDate(), booking.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Car is already booked for the selected dates");
        }

        // Calculate total price: days × pricePerDay
        long days = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate());
        BigDecimal totalPrice = car.getPricePerDay().multiply(BigDecimal.valueOf(days));
        booking.setTotalPrice(totalPrice);

        // Set full car reference and initial status
        booking.setCar(car);
        booking.setStatus("PENDING_PAYMENT");

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!"PENDING_PAYMENT".equals(booking.getStatus()) && !"AWAITING_VERIFICATION".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending or awaiting verification bookings can be confirmed");
        }

      booking.setStatus("BOOKED");

// Generate 6 digit OTP automatically
String otp = String.format("%06d", new Random().nextInt(1000000));

booking.setPickupOtp(otp);
booking.setPickupVerified(false);
booking.setPickupOtpGeneratedAt(LocalDateTime.now());

Booking saved = bookingRepository.save(booking);

notificationService.createNotification(
        booking.getUser(),
        "Payment successful!\n\n" +
        "Booking Confirmed.\n\n" +
        "Pickup OTP : " + otp
);

emailNotificationService.sendAdminBookingNotification(saved);

return saved;
    }

    @Transactional
    public Booking submitUpiPayment(Long bookingId, String utr) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        
        booking.setUtr(utr);
        booking.setPaymentMethod("UPI");
        booking.setStatus("AWAITING_VERIFICATION");
        
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(booking.getUser(), 
            "Your UPI payment (UTR: " + utr + ") has been submitted for verification. We will notify you once approved.");
        return saved;
    }

    // ─── Cancel booking ─────────────────────────────────────────────────

    @Transactional
    public Booking cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to cancel this booking.");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }
        if ("BOOKED".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }

        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(booking.getUser(), "Your booking for " + booking.getCar().getBrand() + " " + booking.getCar().getName() + " has been cancelled.");
        return saved;
    }

    // ─── Complete booking ───────────────────────────────────────────────

@Transactional
public Booking completeBooking(Long bookingId) {

    System.out.println("completeBooking() called for booking = " + bookingId);

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

    if (!"ACTIVE".equals(booking.getStatus())) {
        throw new RuntimeException("Only active bookings can be marked as completed");
    }

    booking.setStatus("COMPLETED");

    // Clear the return request after completion
    booking.setReturnRequestedAt(null);

    return bookingRepository.save(booking);
}

    // ─── Check availability ─────────────────────────────────────────────

    public boolean isCarAvailable(Long carId, LocalDate startDate, LocalDate endDate) {
        Car car = carRepository.findById(carId).orElse(null);
        if (car == null || !car.isAvailable()) {
            return false;
        }
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(carId, startDate, endDate);
        return overlapping.isEmpty();
    }

    // ─── Queries ────────────────────────────────────────────────────────

    public Page<Booking> getAllBookings(Pageable pageable) {
        return bookingRepository.findAllWithDetails(pageable);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public Page<Booking> getBookingsByUser(Long userId, Pageable pageable) {
        return bookingRepository.findByUserId(userId, pageable);
    }

    public Page<Booking> getBookingsByCar(Long carId, Pageable pageable) {
        return bookingRepository.findByCarId(carId, pageable);
    }

    // ─── OTP-based pickup ───────────────────────────────────────────────
    
@Transactional
public Booking generatePickupOtp(Long bookingId, Long userId) {

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() ->
                    new RuntimeException("Booking not found"));

    if (!booking.getUser().getId().equals(userId)) {
        throw new RuntimeException("You are not authorized to perform this action.");
    }

    if (!"BOOKED".equals(booking.getStatus())) {
        throw new RuntimeException(
                "Pickup OTP can only be generated for booked vehicles.");
    }

    String otp = String.format("%06d", new Random().nextInt(1000000));

    booking.setPickupOtp(otp);
    booking.setPickupVerified(false);
    booking.setPickupOtpGeneratedAt(LocalDateTime.now());

    Booking saved = bookingRepository.save(booking);

    notificationService.createNotification(
            booking.getUser(),
            "Your pickup OTP is " + otp +
            ". Share this OTP with the host during pickup."
    );

    return saved;
}

@Transactional
public Booking verifyPickupOtp(Long bookingId, String otp, Long userId) {

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() ->
                    new RuntimeException("Booking not found"));

    if (!booking.getUser().getId().equals(userId)) {
        throw new RuntimeException("You are not authorized to perform this action.");
    }

    if (!"BOOKED".equals(booking.getStatus())) {
        throw new RuntimeException("Booking is not ready for pickup.");
    }

    if (booking.getPickupOtp() == null) {
        throw new RuntimeException("Pickup OTP has not been generated.");
    }

    if (!booking.getPickupOtp().equals(otp)) {
        throw new RuntimeException("Invalid Pickup OTP.");
    }

    booking.setPickupVerified(true);
    booking.setStatus("ACTIVE");

    // Clear OTP after successful verification
    booking.setPickupOtp(null);
    booking.setPickupOtpGeneratedAt(null);

    Booking saved = bookingRepository.save(booking);

    notificationService.createNotification(
            booking.getUser(),
            "Pickup verified successfully. Your rental is now active."
    );

    return saved;
}

@Transactional
public Booking requestReturn(Long bookingId, Long userId) {

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() ->
                    new RuntimeException("Booking not found with id: " + bookingId));

    if (!booking.getUser().getId().equals(userId)) {
        throw new RuntimeException("You are not authorized to perform this action.");
    }

    // Only ACTIVE bookings can request return
    if (!"ACTIVE".equals(booking.getStatus())) {
        throw new RuntimeException("Only active bookings can request vehicle return.");
    }

    // Prevent duplicate requests
    if (booking.getReturnRequestedAt() != null) {
        throw new RuntimeException("Return has already been requested.");
    }

    booking.setReturnRequestedAt(LocalDateTime.now());

    return bookingRepository.save(booking);
}


@Transactional
public Booking approveReturn(Long bookingId) {

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() ->
                    new RuntimeException("Booking not found with id: " + bookingId));

    if (!"ACTIVE".equals(booking.getStatus())) {
        throw new RuntimeException("Only active bookings can be approved.");
    }

    if (booking.getReturnRequestedAt() == null) {
        throw new RuntimeException("Return has not been requested.");
    }

    return completeBooking(bookingId);
}
@Transactional
public Booking markPaymentFailed(Long bookingId) {

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() ->
                    new RuntimeException("Booking not found with id: " + bookingId));

    if (!"PENDING_PAYMENT".equals(booking.getStatus())) {
        throw new RuntimeException("Only pending payment bookings can be marked as failed");
    }

    booking.setStatus("PAYMENT_FAILED");

    return bookingRepository.save(booking);
}
}
