package com.vehiclerental.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.vehiclerental.backend.model.Payment;
import com.vehiclerental.backend.repository.PaymentRepository;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    public String getRazorpayKeyId() {
        return keyId;
    }

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    public String createRazorpayOrder(BigDecimal amount) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in paise (1 INR = 100 paise)
        orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = razorpayClient.orders.create(orderRequest);
        return order.get("id");
    }

    @Autowired
    private com.vehiclerental.backend.repository.BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    public Payment verifyAndSavePayment(Payment payment) throws RazorpayException {
        // Verify signature
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", payment.getRazorpayOrderId());
        options.put("razorpay_payment_id", payment.getRazorpayPaymentId());
        options.put("razorpay_signature", payment.getRazorpaySignature());

        boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

        if (isValid) {
            payment.setPaymentStatus("SUCCESS");
            payment.setTransactionId(payment.getRazorpayPaymentId());
            
            // Update booking status to BOOKED (confirmed) if it was pending or just to ensure it's confirmed
            if (payment.getBooking() != null && payment.getBooking().getId() != null) {
                bookingRepository.findById(payment.getBooking().getId()).ifPresent(booking -> {
                    booking.setStatus("BOOKED");
                    bookingRepository.save(booking);
                    
                    // Notify user
                    notificationService.createNotification(booking.getUser(), 
                        "Payment successful for your booking of " + booking.getCar().getBrand() + " " + booking.getCar().getName() + ".");
                });
            }
        } else {
            payment.setPaymentStatus("FAILED");
            throw new RuntimeException("Payment signature verification failed!");
        }

        return paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsByBooking(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }
}
