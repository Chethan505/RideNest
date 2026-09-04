package com.vehiclerental.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Booking {

private LocalDateTime returnRequestedAt;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private BigDecimal totalPrice;

    private String pickupOtp;

private Boolean pickupVerified = false;

private LocalDateTime pickupOtpGeneratedAt;

    // BOOKED, CANCELLED, COMPLETED, PENDING_PAYMENT, AWAITING_VERIFICATION
    @Column(nullable = false)
    private String status;

    private String paymentMethod; // "GATEWAY" or "UPI"
    private String utr; // For manual UPI verification

    // ─── Getters & Setters ──────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getUtr() { return utr; }
    public void setUtr(String utr) { this.utr = utr; }

    public String getPickupOtp() {
    return pickupOtp;
}

public void setPickupOtp(String pickupOtp) {
    this.pickupOtp = pickupOtp;
}

public Boolean getPickupVerified() {
    return pickupVerified;
}

public void setPickupVerified(Boolean pickupVerified) {
    this.pickupVerified = pickupVerified;
}

public LocalDateTime getPickupOtpGeneratedAt() {
    return pickupOtpGeneratedAt;
}

public void setPickupOtpGeneratedAt(LocalDateTime pickupOtpGeneratedAt) {
    this.pickupOtpGeneratedAt = pickupOtpGeneratedAt;
}

public LocalDateTime getReturnRequestedAt() {
    return returnRequestedAt;
}

public void setReturnRequestedAt(LocalDateTime returnRequestedAt) {
    this.returnRequestedAt = returnRequestedAt;
}
}
