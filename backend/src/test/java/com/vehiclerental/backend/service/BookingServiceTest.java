package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.repository.BookingRepository;
import com.vehiclerental.backend.repository.CarRepository;
import com.vehiclerental.backend.repository.UserRepository;
import com.vehiclerental.backend.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CarRepository carRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void testBookCar_Success() {
        // Arrange
        Car car = new Car();
        car.setId(1L);
        car.setAvailable(true);
        car.setPricePerDay(new BigDecimal("50.00"));

        User user = new User();
        user.setId(1L);

        Booking bookingReq = new Booking();
        bookingReq.setCar(car);
        bookingReq.setUser(user);
        bookingReq.setStartDate(LocalDate.now().plusDays(1));
        bookingReq.setEndDate(LocalDate.now().plusDays(3)); // 2 days

        when(carRepository.findById(1L)).thenReturn(Optional.of(car));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookingRepository.findOverlappingBookings(any(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Booking createdBooking = bookingService.bookCar(bookingReq);

        // Assert
        assertNotNull(createdBooking);
        assertEquals(new BigDecimal("100.00"), createdBooking.getTotalPrice());
        assertEquals("BOOKED", createdBooking.getStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testBookCar_CarNotAvailable() {
        // Arrange
        Car car = new Car();
        car.setId(1L);
        car.setAvailable(false); // Not available
        
        User user = new User();
        user.setId(1L);

        Booking bookingReq = new Booking();
        bookingReq.setCar(car);
        bookingReq.setUser(user);

        when(carRepository.findById(1L)).thenReturn(Optional.of(car));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            bookingService.bookCar(bookingReq);
        });

        assertEquals("Car is not available for booking", exception.getMessage());
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
