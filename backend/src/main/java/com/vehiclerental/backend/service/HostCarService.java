package com.vehiclerental.backend.service;

import com.vehiclerental.backend.model.Car;
import com.vehiclerental.backend.model.HostCar;
import com.vehiclerental.backend.repository.CarRepository;
import com.vehiclerental.backend.repository.HostCarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HostCarService {

    @Autowired
    private HostCarRepository hostCarRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private NotificationService notificationService;

    public HostCar submitCar(HostCar car) {
        car.setApprovalStatus("PENDING");
        return hostCarRepository.save(car);
    }

    public HostCar updateStatus(Long id, String status) {
        HostCar hostCar = hostCarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Host car not found"));
        
        hostCar.setApprovalStatus(status);
        
        if ("APPROVED".equals(status)) {
            // Create a corresponding entry in the main Car table
            com.vehiclerental.backend.model.Car rentableCar = new com.vehiclerental.backend.model.Car();
            rentableCar.setName(hostCar.getName());
            rentableCar.setBrand(hostCar.getBrand());
            rentableCar.setType(hostCar.getType());
            rentableCar.setFuelType(hostCar.getFuelType());
            rentableCar.setPricePerDay(hostCar.getPricePerDay());
            rentableCar.setLocation(hostCar.getLocation());
            rentableCar.setImage(hostCar.getImage());
            rentableCar.setAvailable(true);
            rentableCar.setLocked(true);
            carRepository.save(rentableCar);
            
            notificationService.createNotification(hostCar.getOwner(), "Congratulations! Your car " + hostCar.getName() + " has been approved and is now live.");
        } else if ("REJECTED".equals(status)) {
            notificationService.createNotification(hostCar.getOwner(), "Your car listing for " + hostCar.getName() + " was not approved. Please check the details and try again.");
        }

        return hostCarRepository.save(hostCar);
    }

    public List<HostCar> getPendingCars() {
        return hostCarRepository.findByApprovalStatus("PENDING");
    }

    public List<HostCar> getApprovedCars() {
        return hostCarRepository.findByApprovalStatus("APPROVED");
    }

    public List<HostCar> getCarsByOwner(Long ownerId) {
        System.out.println("Searching cars for ownerId = " + ownerId);
        return hostCarRepository.findByOwnerId(ownerId);
    }

    public void deleteHostCar(Long id) {
        hostCarRepository.deleteById(id);
    }



}
