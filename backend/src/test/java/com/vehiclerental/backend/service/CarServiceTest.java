package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.repository.CarRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarServiceTest {

    @Mock
    private CarRepository carRepository;

    @InjectMocks
    private CarService carService;

    @Test
    void testAddCar() {
        Car car = new Car();
        car.setName("Model S");
        car.setBrand("Tesla");
        car.setPricePerDay(new BigDecimal("100.00"));

        when(carRepository.save(any(Car.class))).thenReturn(car);

        Car savedCar = carService.addCar(car);

        assertNotNull(savedCar);
        assertEquals("Model S", savedCar.getName());
        assertEquals("Tesla", savedCar.getBrand());
        verify(carRepository, times(1)).save(car);
    }

    @Test
    void testGetCarById_Success() {
        Car car = new Car();
        car.setId(1L);
        car.setName("Civic");

        when(carRepository.findById(1L)).thenReturn(Optional.of(car));

        Optional<Car> foundCar = carService.getCarById(1L);

        assertTrue(foundCar.isPresent());
        assertEquals("Civic", foundCar.get().getName());
        verify(carRepository, times(1)).findById(1L);
    }

    @Test
    void testUpdateCar_NotFound() {
        Car updateData = new Car();
        updateData.setName("New Name");

        when(carRepository.findById(99L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            carService.updateCar(99L, updateData);
        });

        assertEquals("Car not found with id: 99", exception.getMessage());
        verify(carRepository, never()).save(any(Car.class));
    }
}
