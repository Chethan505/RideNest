package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    // ─── CRUD ───────────────────────────────────────────────────────────

    @CacheEvict(value = "cars", allEntries = true)
    public Car addCar(Car car) {
        return carRepository.save(car);
    }

    @CacheEvict(value = "cars", allEntries = true)
    public Car updateCar(Long id, Car updatedCar) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found with id: " + id));

        car.setName(updatedCar.getName());
        car.setBrand(updatedCar.getBrand());
        car.setType(updatedCar.getType());
        car.setFuelType(updatedCar.getFuelType());
        car.setPricePerDay(updatedCar.getPricePerDay());
        car.setAvailable(updatedCar.isAvailable());
        car.setLocation(updatedCar.getLocation());

        return carRepository.save(car);
    }

    @CacheEvict(value = "cars", allEntries = true)
    public void deleteCar(Long id) {
        if (!carRepository.existsById(id)) {
            throw new RuntimeException("Car not found with id: " + id);
        }
        carRepository.deleteById(id);
    }

    // ─── Queries ────────────────────────────────────────────────────────

    @Cacheable(value = "cars")
    public Page<Car> getAllCars(Pageable pageable) {
        return carRepository.findAll(pageable);
    }

    @Cacheable(value = "cars", key = "#id")
    public Optional<Car> getCarById(Long id) {
        return carRepository.findById(id);
    }

    @Cacheable(value = "cars")
    public Page<Car> filterCars(String type, String location, BigDecimal minPrice, BigDecimal maxPrice, Boolean available, Pageable pageable) {
        return carRepository.filterCars(type, location, minPrice, maxPrice, available, pageable);
    }
}
