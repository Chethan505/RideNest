package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.model.HostCar;
import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.service.HostCarService;
import com.vehiclerental.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/host")
public class HostCarController {

    @Autowired
    private HostCarService hostCarService;

    @Autowired
    private UserService userService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitCar(@RequestBody HostCar car, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "You must be logged in to host a car"));
        }
        try {
            // Re-fetch user to ensure it's a managed entity
            User managedUser = userService.findByEmail(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            car.setOwner(managedUser);
            car.setApprovalStatus("PENDING");
            HostCar saved = hostCarService.submitCar(car);
            return ResponseEntity.ok(Map.of("message", "Car submitted for approval", "car", saved));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Database error: " + e.getMessage()));
        }
    }



    @GetMapping("/approved")
    public List<HostCar> getApprovedCars() {
        return hostCarService.getApprovedCars();
    }

    // ─── Admin Endpoints ────────────────────────────────────────────────

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<HostCar> getPendingCars() {
        return hostCarService.getPendingCars();
    }

    @PutMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveCar(@PathVariable Long id) {
        HostCar approved = hostCarService.updateStatus(id, "APPROVED");
        return ResponseEntity.ok(Map.of("message", "Car approved successfully", "car", approved));
    }

    @PutMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectCar(@PathVariable Long id) {
        HostCar rejected = hostCarService.updateStatus(id, "REJECTED");
        return ResponseEntity.ok(Map.of("message", "Car rejected", "car", rejected));
    }


    @GetMapping("/my-cars")
public List<HostCar> getMyCars(@AuthenticationPrincipal User user) {

    System.out.println("Logged in user: " + user);
    System.out.println("User ID: " + (user != null ? user.getId() : "NULL"));

    return hostCarService.getCarsByOwner(user.getId());
}
}
