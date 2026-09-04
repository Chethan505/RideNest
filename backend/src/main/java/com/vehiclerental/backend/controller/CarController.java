package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    @Autowired
    private CarService carService;

    // ─── Public endpoints ───────────────────────────────────────────────

    /** Get all cars */
    @GetMapping
    public Page<Car> getAllCars(@PageableDefault(size = 10) Pageable pageable) {
        return carService.getAllCars(pageable);
    }

    /** Get car by ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCarById(@PathVariable Long id) {
        return carService.getCarById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Filter cars by type, location, price range, availability */
    @GetMapping("/filter")
    public Page<Car> filterCars(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean available,
            @PageableDefault(size = 10) Pageable pageable) {
        return carService.filterCars(type, location, minPrice, maxPrice, available, pageable);
    }

    // ─── Admin-only endpoints ───────────────────────────────────────────

    /** Add a new car (ADMIN only) */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addCar(@RequestBody Car car) {
        Car saved = carService.addCar(car);
        return ResponseEntity.ok(Map.of("message", "Car added successfully", "car", saved));
    }

    /** Update a car (ADMIN only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCar(@PathVariable Long id, @RequestBody Car car) {
        try {
            Car updated = carService.updateCar(id, car);
            return ResponseEntity.ok(Map.of("message", "Car updated successfully", "car", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Delete a car (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        try {
            carService.deleteCar(id);
            return ResponseEntity.ok(Map.of("message", "Car deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
