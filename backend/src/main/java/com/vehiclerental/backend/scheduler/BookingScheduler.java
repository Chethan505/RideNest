package com.vehiclerental.backend.scheduler;

import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.repository.BookingRepository;
import com.vehiclerental.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class BookingScheduler {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    @Scheduled(cron = "0 * * * * *") 
    public void completeExpiredBookings() {

        List<Booking> activeBookings =
                bookingRepository.findByStatus("ACTIVE");

        for (Booking booking : activeBookings) {

            if (booking.getEndDate().isBefore(LocalDate.now())) {

                bookingService.completeBooking(booking.getId());

            }
        }
    }
}