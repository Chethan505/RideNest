package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.vehiclerental.backend.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;


import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
private FileStorageService fileStorageService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ─── UserDetailsService ─────────────────────────────────────────────

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String trimmedEmail = email != null ? email.trim() : "";
        return userRepository.findByEmail(trimmedEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    // ─── Registration ───────────────────────────────────────────────────

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        return userRepository.save(user);
    }

    // ─── Lookup helpers ─────────────────────────────────────────────────

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email != null ? email.trim() : "");
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email != null ? email.trim() : "");
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /** Save a user without re-encoding the password (for profile updates) */
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public long countAdmins() {
        return userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .count();
    }

    public String uploadLicense(
        String email,
        String licenseNumber,
        MultipartFile licenseImage,
        MultipartFile idProofImage) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.setDrivingLicenseNumber(licenseNumber);

    String licenseFile =
            fileStorageService.saveFile(licenseImage);

    user.setDrivingLicenseImage(licenseFile);

    if (idProofImage != null && !idProofImage.isEmpty()) {

        String idFile =
                fileStorageService.saveFile(idProofImage);

        user.setIdProofImage(idFile);
    }

    user.setVerificationStatus("PENDING");
    user.setRejectionReason(null);

    userRepository.save(user);

    return "License uploaded successfully. Waiting for admin verification.";
}


public List<User> getPendingVerificationUsers() {
    return userRepository.findByRoleAndVerificationStatus(
            "USER",
            "PENDING"
    );
}

public User approveUser(Long id) {

    User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.setVerificationStatus("APPROVED");
    user.setRejectionReason(null);

    return userRepository.save(user);
}

public User rejectUser(Long id, String reason) {

    User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.setVerificationStatus("REJECTED");
    user.setRejectionReason(reason);

    return userRepository.save(user);
}
}
