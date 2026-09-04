package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.service.BookingService;
import com.vehiclerental.backend.service.EmailNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    // ─── Book a car ─────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking saved = bookingService.bookCar(booking);
            return ResponseEntity.ok(Map.of(
                    "message", "Car booked successfully",
                    "booking", saved
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Cancel booking ─────────────────────────────────────────────────

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @AuthenticationPrincipal com.vehiclerental.backend.model.User user) {
        try {
            Booking cancelled = bookingService.cancelBooking(id, user.getId());
            emailNotificationService.sendAdminCancellationNotification(cancelled);
            return ResponseEntity.ok(Map.of(
                    "message", "Booking cancelled successfully",
                    "booking", cancelled
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long id) {
        try {
            Booking confirmed = bookingService.confirmBooking(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Payment confirmed and booking finalized",
                    "booking", confirmed
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/submit-upi")
    public ResponseEntity<?> submitUpi(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            String utr = data.get("utr");
            Booking updated = bookingService.submitUpiPayment(id, utr);
            return ResponseEntity.ok(Map.of(
                    "message", "Payment submitted for verification",
                    "booking", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Complete booking ───────────────────────────────────────────────

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Long id) {
        try {
            Booking completed = bookingService.completeBooking(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Booking marked as completed",
                    "booking", completed
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Check availability ─────────────────────────────────────────────

    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam Long carId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        boolean available = bookingService.isCarAvailable(
                carId, LocalDate.parse(startDate), LocalDate.parse(endDate));
        return ResponseEntity.ok(Map.of("available", available));
    }

    // ─── Get bookings ───────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Booking> getAllBookings(@PageableDefault(
    size = 10,
    sort = "id",
    direction = org.springframework.data.domain.Sort.Direction.DESC
) Pageable pageable) {
        return bookingService.getAllBookings(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public Page<Booking> getUserBookings(@PathVariable Long userId, @PageableDefault(
    size = 10,
    sort = "id",
    direction = org.springframework.data.domain.Sort.Direction.DESC
) Pageable pageable) {
        return bookingService.getBookingsByUser(userId, pageable);
    }

    @GetMapping("/car/{carId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Booking> getCarBookings(@PathVariable Long carId, @PageableDefault(
    size = 10,
    sort = "id",
    direction = org.springframework.data.domain.Sort.Direction.DESC
) Pageable pageable) {
        return bookingService.getBookingsByCar(carId, pageable);
    }

    @PostMapping("/{bookingId}/generate-pickup-otp")
public ResponseEntity<Booking> generatePickupOtp(
        @PathVariable Long bookingId, @AuthenticationPrincipal com.vehiclerental.backend.model.User user) {

    Booking booking = bookingService.generatePickupOtp(bookingId, user.getId());

    return ResponseEntity.ok(booking);
}

@PostMapping("/{bookingId}/verify-pickup-otp")
public ResponseEntity<?> verifyPickupOtp(
        @PathVariable Long bookingId,
        @RequestBody Map<String, String> request, @AuthenticationPrincipal com.vehiclerental.backend.model.User user) {

    try {

        Booking booking = bookingService.verifyPickupOtp(
                bookingId,
                request.get("otp"), user.getId()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Pickup verified successfully",
                "status", booking.getStatus()
        ));

    } catch (RuntimeException e) {

        return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
        );
    }
}

@PutMapping("/{bookingId}/request-return")
@PreAuthorize("hasRole('USER')")
public ResponseEntity<?> requestReturn(@PathVariable Long bookingId, @AuthenticationPrincipal com.vehiclerental.backend.model.User user) {

    try {

        Booking booking = bookingService.requestReturn(bookingId, user.getId());

        return ResponseEntity.ok(Map.of(
                "message", "Return request submitted successfully.",
                "booking", booking
        ));

    } catch (RuntimeException e) {

        return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
        );
    }
}

@PutMapping("/{bookingId}/approve-return")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> approveReturn(@PathVariable Long bookingId) {

    try {

        Booking booking = bookingService.approveReturn(bookingId);

        return ResponseEntity.ok(Map.of(
                "message", "Return approved successfully.",
                "booking", booking
        ));

    } catch (RuntimeException e) {

        return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
        );
    }
}

@PutMapping("/{id}/payment-failed")
public ResponseEntity<?> markPaymentFailed(@PathVariable Long id) {
    try {

        Booking booking = bookingService.markPaymentFailed(id);

        return ResponseEntity.ok(Map.of(
                "message", "Payment marked as failed",
                "booking", booking
        ));

    } catch (RuntimeException e) {

        return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
        );
    }
}
}
