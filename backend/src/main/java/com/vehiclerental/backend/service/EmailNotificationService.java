package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.model.Notification;
import com.vehiclerental.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendAdminBookingNotification(Booking booking) {
        sendNotification(booking, "NEW BOOKING");
    }

    public void sendAdminCancellationNotification(Booking booking) {
        sendNotification(booking, "BOOKING CANCELLED");
    }

    private void sendNotification(Booking booking, String action) {
        String name = booking.getUser() != null ? booking.getUser().getName() : "Unknown User";
        String carName = booking.getCar() != null ? booking.getCar().getBrand() + " " + booking.getCar().getName() : "Unknown Car";

        String adminEmailMessage = String.format(
            "\n=========================================\n" +
            "      %s NOTIFICATION (EMAIL)     \n" +
            "=========================================\n" +
            "Car: %s\n" +
            "Renter: %s (ID: %d)\n" +
            "Dates: %s to %s\n" +
            "Total Price: ₹%s\n" +
            "Status: %s\n" +
            "=========================================\n",
            action,
            carName,
            name, booking.getUser() != null ? booking.getUser().getId() : 0,
            booking.getStartDate(), booking.getEndDate(),
            booking.getTotalPrice(),
            booking.getStatus()
        );

        System.out.println(adminEmailMessage);

        // Save internal web notification
        String shortMessage = action + ": " + name + " - " + carName;
        notificationRepository.save(new Notification(booking.getUser(), shortMessage));
    }
}
