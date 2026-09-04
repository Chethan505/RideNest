package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.repository.BookingRepository;
import com.vehiclerental.backend.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class KeylessAccessService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarRepository carRepository;

    public String unlockCar(Long userId, Long carId) {
        if (!hasActiveBooking(userId, carId)) {
            throw new RuntimeException("Access Denied: No active booking found for this car.");
        }

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        car.setLocked(false);
        carRepository.save(car);

        return "Car unlocked successfully.";
    }

    public String lockCar(Long userId, Long carId) {
        if (!hasActiveBooking(userId, carId)) {
            throw new RuntimeException("Access Denied: No active booking found for this car.");
        }

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        car.setLocked(true);
        carRepository.save(car);

        return "Car locked successfully.";
    }

    private boolean hasActiveBooking(Long userId, Long carId) {
        List<Booking> activeBookings = bookingRepository.findActiveBookingByUserAndCar(userId, carId, LocalDate.now());
        return !activeBookings.isEmpty();
    }
}
