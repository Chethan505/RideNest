package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.service.KeylessAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/access")
public class KeylessAccessController {

    @Autowired
    private KeylessAccessService keylessAccessService;

    @PostMapping("/unlock/{carId}")
    public ResponseEntity<?> unlockCar(@PathVariable Long carId, @AuthenticationPrincipal User user) {
        try {
            String result = keylessAccessService.unlockCar(user.getId(), carId);
            return ResponseEntity.ok(Map.of("message", result, "locked", false));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/lock/{carId}")
    public ResponseEntity<?> lockCar(@PathVariable Long carId, @AuthenticationPrincipal User user) {
        try {
            String result = keylessAccessService.lockCar(user.getId(), carId);
            return ResponseEntity.ok(Map.of("message", result, "locked", true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }
}
