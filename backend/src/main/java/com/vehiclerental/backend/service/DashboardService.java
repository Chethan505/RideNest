package com.vehiclerental.backend.service;

import com.vehiclerental.backend.repository.BookingRepository;
import com.vehiclerental.backend.repository.CarRepository;
import com.vehiclerental.backend.repository.PaymentRepository;
import com.vehiclerental.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long activeCars = carRepository.countByAvailable(true);
        BigDecimal totalRevenue = paymentRepository.calculateTotalRevenue();

        stats.put("totalUsers", totalUsers);
        stats.put("totalBookings", totalBookings);
        stats.put("activeCars", activeCars);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        return stats;
    }
}
