package com.vehiclerental.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.repository.CarRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CarControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        Car car = new Car();
        car.setName("Model 3");
        car.setBrand("Tesla");
        car.setType("Electric");
        car.setLocation("New York");
        car.setPricePerDay(new BigDecimal("150.00"));
        car.setAvailable(true);
        carRepository.save(car);
    }

    @Test
    void testGetAllCars_PublicAccess() throws Exception {
        mockMvc.perform(get("/api/cars")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(roles = "ADMIN") // Mock an admin user
    void testAddCar_AdminAccess() throws Exception {
        Car newCar = new Car();
        newCar.setName("Mustang");
        newCar.setBrand("Ford");
        newCar.setType("Coupe");
        newCar.setLocation("Detroit");
        newCar.setPricePerDay(new BigDecimal("120.00"));

        mockMvc.perform(post("/api/cars") 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCar)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.car.name", is("Mustang")));
    }

    @Test
    @WithMockUser(roles = "USER") // Regular users should be blocked from adding cars
    void testAddCar_UserAccess_Forbidden() throws Exception {
        Car newCar = new Car();
        newCar.setName("Mustang");

        mockMvc.perform(post("/api/cars") 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCar)))
                .andExpect(status().isForbidden()); // 403 Forbidden
    }
}
