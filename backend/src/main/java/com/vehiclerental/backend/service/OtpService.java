package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.PasswordResetOtp;
import com.vehiclerental.backend.repository.PasswordResetOtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    private static final SecureRandom random = new SecureRandom();

    @Transactional
    public void generateAndSendOtp(String email) {

        otpRepository.deleteByEmail(email);

        String otp = String.format("%06d", random.nextInt(1000000));

        PasswordResetOtp passwordResetOtp = new PasswordResetOtp(
                email,
                otp,
                LocalDateTime.now().plusMinutes(10)
        );

        otpRepository.save(passwordResetOtp);

        emailService.sendEmail(
                email,
                "RideNest Password Reset OTP",
                "Your OTP is: " + otp + "\n\nThis OTP is valid for 10 minutes."
        );
    }

    public boolean verifyOtp(String email, String otp) {

        PasswordResetOtp savedOtp = otpRepository.findByEmail(email).orElse(null);

        if (savedOtp == null) {
            return false;
        }

        if (savedOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(savedOtp);
            return false;
        }

        return savedOtp.getOtp().equals(otp);
    }

    @Transactional
    public void deleteOtp(String email) {
        otpRepository.deleteByEmail(email);
    }

    @Transactional
    public PasswordResetOtp getValidOtp(String email, String otp) {

        PasswordResetOtp savedOtp = otpRepository.findByEmail(email).orElse(null);

        if (savedOtp == null) {
            return null;
        }

        if (savedOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(savedOtp);
            return null;
        }

        if (!savedOtp.getOtp().equals(otp)) {
            return null;
        }

        return savedOtp;
    }
}