package com.vehiclerental.backend.repository;

import com.vehiclerental.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.*;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByVerificationStatus(String verificationStatus);
    Optional<User> findById(Long id);
    List<User> findByRoleAndVerificationStatus(
        String role,
        String verificationStatus
);
}
