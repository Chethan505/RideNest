package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.model.Payment;
import com.vehiclerental.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${upi.vpa}")
    private String upiVpa;

    @Value("${upi.name}")
    private String upiName;

    public Map<String, String> getUpiConfig() {
        return Map.of("vpa", upiVpa, "name", upiName);
    }

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/key")
    public ResponseEntity<?> getRazorpayKey() {
        return ResponseEntity.ok(Map.of(
            "keyId", paymentService.getRazorpayKeyId(),
            "upi", getUpiConfig()
        ));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            BigDecimal amount = new BigDecimal(data.get("amount").toString());
            String orderId = paymentService.createRazorpayOrder(amount);
            return ResponseEntity.ok(Map.of("orderId", orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Payment payment) {
        try {
            return ResponseEntity.ok(paymentService.verifyAndSavePayment(payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Payment>> getPaymentsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBooking(bookingId));
    }
}
