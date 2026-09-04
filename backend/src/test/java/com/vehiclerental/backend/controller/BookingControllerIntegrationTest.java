package com.vehiclerental.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vehiclerental.backend.model.Booking;
import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.repository.BookingRepository;
import com.vehiclerental.backend.repository.CarRepository;
import com.vehiclerental.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private Car testCar;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("password123");
        testUser.setRole("USER");
        testUser = userRepository.save(testUser);

        testCar = new Car();
        testCar.setName("Civic");
        testCar.setBrand("Honda");
        testCar.setType("Sedan");
        testCar.setLocation("Los Angeles");
        testCar.setPricePerDay(new BigDecimal("50.00"));
        testCar.setAvailable(true);
        testCar = carRepository.save(testCar);
    }

    @Test
    @WithMockUser(roles = "USER")
    void testCreateBooking_Success() throws Exception {
        String jsonPayload = "{" +
                "\"user\": {\"id\": " + testUser.getId() + "}," +
                "\"car\": {\"id\": " + testCar.getId() + "}," +
                "\"startDate\": \"" + LocalDate.now().plusDays(1) + "\"," +
                "\"endDate\": \"" + LocalDate.now().plusDays(3) + "\"" +
                "}";

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Car booked successfully")))
                .andExpect(jsonPath("$.booking.status", is("BOOKED")));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testCheckAvailability() throws Exception {
        mockMvc.perform(get("/api/bookings/check-availability")
                .param("carId", testCar.getId().toString())
                .param("startDate", LocalDate.now().plusDays(1).toString())
                .param("endDate", LocalDate.now().plusDays(3).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available", is(true)));
    }
}
