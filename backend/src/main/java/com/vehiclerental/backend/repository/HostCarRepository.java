package com.vehiclerental.backend.repository;

import com.vehiclerental.backend.model.HostCar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostCarRepository extends JpaRepository<HostCar, Long> {
    List<HostCar> findByOwnerId(Long ownerId);
    List<HostCar> findByApprovalStatus(String status);
}
