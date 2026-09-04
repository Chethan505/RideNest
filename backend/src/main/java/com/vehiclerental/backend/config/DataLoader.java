package com.vehiclerental.backend.config;

import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.model.User;
import com.vehiclerental.backend.repository.CarRepository;
import com.vehiclerental.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Autowired
    private CarRepository carRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Master Admin
        if (userRepository.findAll().stream().noneMatch(u -> "ADMIN".equals(u.getRole()))) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@rental.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Default admin created: admin@rental.com / password123");
        }


        // Seed cars
        if (carRepository.count() == 0) {
            Car c1 = new Car();
            c1.setName("Creta");
            c1.setBrand("Hyundai");
            c1.setType("SUV");
            c1.setFuelType("Diesel");
            c1.setPricePerDay(new BigDecimal("120.00"));
            c1.setAvailable(true);
            c1.setLocation("Mumbai");
            c1.setImage("https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000");

            Car c2 = new Car();
            c2.setName("City");
            c2.setBrand("Honda");
            c2.setType("Sedan");
            c2.setFuelType("Petrol");
            c2.setPricePerDay(new BigDecimal("150.00"));
            c2.setAvailable(true);
            c2.setLocation("Delhi");
            c2.setImage("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000");

            Car c3 = new Car();
            c3.setName("Baleno");
            c3.setBrand("Maruti Suzuki");
            c3.setType("Hatchback");
            c3.setFuelType("Petrol");
            c3.setPricePerDay(new BigDecimal("10.00"));
            c3.setAvailable(true);
            c3.setLocation("Bangalore");
            c3.setImage("https://images.unsplash.com/photo-1567808291548-fc3ee04dbac0?auto=format&fit=crop&q=80&w=1000");

            Car c4 = new Car();
            c4.setName("Fortuner");
            c4.setBrand("Toyota");
            c4.setType("SUV");
            c4.setFuelType("Diesel");
            c4.setPricePerDay(new BigDecimal("250.00"));
            c4.setAvailable(true);
            c4.setLocation("Mumbai");
            c4.setImage("https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000");

            Car c5 = new Car();
            c5.setName("Thar");
            c5.setBrand("Mahindra");
            c5.setType("SUV");
            c5.setFuelType("Diesel");
            c5.setPricePerDay(new BigDecimal("200.00"));
            c5.setAvailable(true);
            c5.setLocation("Bangalore");
            c5.setImage("https://images.unsplash.com/photo-1662531633513-f427f71933df?auto=format&fit=crop&q=80&w=1000");

            carRepository.save(c1);
            carRepository.save(c2);
            carRepository.save(c3);
            carRepository.save(c4);
            carRepository.save(c5);
            System.out.println("Default cars injected with INR prices!");
        }

        // Seed a default test user
        if (userRepository.findByEmail("test@example.com").isEmpty()) {
            User testUser = new User();
            testUser.setName("Test User");
            testUser.setEmail("test@example.com");
            testUser.setPassword(passwordEncoder.encode("password123"));
            testUser.setRole("USER");
            userRepository.save(testUser);
            System.out.println("Test user created: test@example.com / password123");
        }
    }
}
