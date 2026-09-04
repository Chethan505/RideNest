package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.security.JwtUtil;
import com.vehiclerental.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import com.vehiclerental.backend.service.EmailService;
import com.vehiclerental.backend.service.OtpService;
import com.vehiclerental.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.vehiclerental.backend.model.PasswordResetOtp;
import java.util.*;
import com.vehiclerental.backend.service.GoogleAuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.vehiclerental.backend.dto.GoogleLoginRequest;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;



import com.vehiclerental.backend.dto.LoginRequest;
import com.vehiclerental.backend.dto.RefreshTokenRequest;
import com.vehiclerental.backend.dto.RegisterRequest;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
private EmailService emailService;

@Autowired
private OtpService otpService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
private PasswordEncoder passwordEncoder;

@Autowired
private UserRepository userRepository;
@Autowired
private GoogleAuthService googleAuthService;

    // ─── Register (USER role) ───────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        if (userService.emailExists(request.getEmail())) {
            return error("Email is already in use!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("USER");
        User saved = userService.registerUser(user);

        String token = jwtUtil.generateToken(saved);
        String refreshToken = jwtUtil.generateRefreshToken(saved);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("token", token);
        response.put("refreshToken", refreshToken);
        response.put("user", sanitize(saved));
        return ResponseEntity.ok(response);
    }

    // ─── Register Admin (first admin only) ──────────────────────────────

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        if (userService.countAdmins() > 0) {
            return error("An administrator already exists. Please login.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("ADMIN");
        User saved = userService.registerUser(user);

        String token = jwtUtil.generateToken(saved);
        String refreshToken = jwtUtil.generateRefreshToken(saved);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Master Admin Account generated successfully!");
        response.put("token", token);
        response.put("refreshToken", refreshToken);
        response.put("user", sanitize(saved));
        return ResponseEntity.ok(response);
    }

    // ─── Login ──────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            String email = loginRequest.getEmail() != null
                    ? loginRequest.getEmail().trim()
                    : "";

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword())
            );

            User user = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);
            String refreshToken = jwtUtil.generateRefreshToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("refreshToken", refreshToken);
            response.put("user", sanitize(user));
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials!"));
        } catch (InternalAuthenticationServiceException e) {
            if (e.getCause() instanceof UsernameNotFoundException) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials!"));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Authentication service unavailable. Please try again."));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Authentication service unavailable. Please try again."));
        }
    }

    // ─── Refresh Token ──────────────────────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        try {
            String username = jwtUtil.extractUsername(requestRefreshToken);
            Optional<User> userOpt = userService.findByEmail(username);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (jwtUtil.validateToken(requestRefreshToken, user)) {
                    String token = jwtUtil.generateToken(user);
                    String newRefreshToken = jwtUtil.generateRefreshToken(user);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("accessToken", token);
                    response.put("refreshToken", newRefreshToken);
                    return ResponseEntity.ok(response);
                }
            }
        } catch (Exception e) {
            // Invalid token
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid refresh token"));
    }

    // ─── Profile endpoints (authenticated) ──────────────────────────────

    @PutMapping("/{id}/picture")
    public ResponseEntity<?> updateProfilePicture(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> optUser = userService.findById(id);
        if (optUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = optUser.get();
        user.setProfilePicture(body.get("profilePicture"));
        userService.saveUser(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile picture updated");
        response.put("user", sanitize(user));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User updatedProfile) {
        Optional<User> optUser = userService.findById(id);
        if (optUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = optUser.get();
        user.setName(updatedProfile.getName());
        user.setDateOfBirth(updatedProfile.getDateOfBirth());
        user.setPhoneNumber(updatedProfile.getPhoneNumber());
        user.setAddress(updatedProfile.getAddress());
        userService.saveUser(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("user", sanitize(user));
        return ResponseEntity.ok(response);
    }


    @PostMapping("/test-email")
public ResponseEntity<String> testEmail() {

    emailService.sendEmail(
            "chethan5515@gmail.com",
            "RideNest Email Test",
            "Congratulations! Email sending is working successfully."
    );

    return ResponseEntity.ok("Email Sent Successfully");
}
@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestParam String email) {

    Optional<User> user = userService.findByEmail(email);

    if (user.isEmpty()) {
        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "message",
                        "No account found with this email."
                ));
    }

    otpService.generateAndSendOtp(email);

    return ResponseEntity.ok(
            Map.of(
                    "message",
                    "OTP sent successfully."
            )
    );
}
@PostMapping("/verify-otp")
public ResponseEntity<?> verifyOtp(
        @RequestParam String email,
        @RequestParam String otp) {

    boolean valid = otpService.verifyOtp(email, otp);

    if (!valid) {
        return ResponseEntity.badRequest().body("Invalid or expired OTP.");
    }

    return ResponseEntity.ok("OTP verified successfully.");
}

@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(
        @RequestParam String email,
        @RequestParam String otp,
        @RequestParam String newPassword) {

    PasswordResetOtp validOtp = otpService.getValidOtp(email, otp);

    if (validOtp == null) {
        return ResponseEntity.badRequest().body("Invalid or expired OTP.");
    }

    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null) {
        return ResponseEntity.badRequest().body("User not found.");
    }

    // Validate password
    if (newPassword == null || newPassword.trim().isEmpty()) {
        return ResponseEntity.badRequest().body("Password cannot be empty.");
    }

    if (newPassword.length() < 8) {
        return ResponseEntity.badRequest()
                .body("Password must be at least 8 characters.");
    }

    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    otpService.deleteOtp(email);

    return ResponseEntity.ok("Password reset successfully.");
}

@PostMapping("/google")
public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {

    try {

        GoogleIdToken.Payload payload =
                googleAuthService.verifyToken(request.getToken());

        String email = payload.getEmail();
        String name = (String) payload.get("name");

        Optional<User> existingUser = userService.findByEmail(email);

        User user;

        if (existingUser.isPresent()) {

            user = existingUser.get();

        } else {

            user = new User();
            user.setName(name);
            user.setEmail(email);

            // Google users don't use this password
            user.setPassword(UUID.randomUUID().toString());

            user.setRole("USER");

            user = userService.registerUser(user);
        }

        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Google login successful");
        response.put("token", token);
        response.put("refreshToken", refreshToken);
        response.put("user", sanitize(user));

        return ResponseEntity.ok(response);

    } catch (Exception e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "error",
                        "Google authentication failed."
                ));
    }
}

@PostMapping("/profile/license")
public ResponseEntity<?> uploadLicense(
        @RequestParam("licenseNumber") String licenseNumber,
        @RequestParam("licenseImage") MultipartFile licenseImage,
        @RequestParam(value = "idProofImage", required = false) MultipartFile idProofImage,
        Authentication authentication) {

    return ResponseEntity.ok(
            userService.uploadLicense(
                    authentication.getName(),
                    licenseNumber,
                    licenseImage,
                    idProofImage
            )
    );
}
@GetMapping("/profile")
public ResponseEntity<?> getProfile(Authentication authentication) {

    User user = userService.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

    return ResponseEntity.ok(sanitize(user));
}

    // ─── Helpers ────────────────────────────────────────────────────────

    private ResponseEntity<?> error(String message) {
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    /** Return user data without the password hash */
    private Map<String, Object> sanitize(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("role", user.getRole());
        map.put("profilePicture", user.getProfilePicture());
        map.put("dateOfBirth", user.getDateOfBirth());
        map.put("phoneNumber", user.getPhoneNumber());
        map.put("address", user.getAddress());
        map.put("drivingLicenseNumber", user.getDrivingLicenseNumber());
map.put("drivingLicenseImage", user.getDrivingLicenseImage());
map.put("idProofImage", user.getIdProofImage());
map.put("verificationStatus", user.getVerificationStatus());
map.put("rejectionReason", user.getRejectionReason());
        return map;
    }
}
