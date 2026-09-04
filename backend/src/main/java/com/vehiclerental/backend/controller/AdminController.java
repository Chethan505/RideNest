package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/pending-verification")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(
                userService.getPendingVerificationUsers()
        );
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {

        userService.approveUser(id);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "User approved successfully."
                )
        );
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        userService.rejectUser(
                id,
                body.get("reason")
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "User rejected successfully."
                )
        );
    }
}