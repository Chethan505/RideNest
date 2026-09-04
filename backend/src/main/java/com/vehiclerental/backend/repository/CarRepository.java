package com.vehiclerental.backend.repository;

import com.vehiclerental.backend.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Car c WHERE c.id = :id")
    Optional<Car> findByIdForUpdate(@Param("id") Long id);

    List<Car> findByType(String type);

    List<Car> findByLocation(String location);

    List<Car> findByAvailable(boolean available);

    long countByAvailable(boolean available);

    List<Car> findByPricePerDayLessThanEqual(BigDecimal maxPrice);

    List<Car> findByPricePerDayBetween(BigDecimal minPrice, BigDecimal maxPrice);

    @Query("SELECT c FROM Car c WHERE "
         + "(:type IS NULL OR c.type = :type) AND "
         + "(:location IS NULL OR LOWER(c.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND "
         + "(:minPrice IS NULL OR c.pricePerDay >= :minPrice) AND "
         + "(:maxPrice IS NULL OR c.pricePerDay <= :maxPrice) AND "
         + "(:available IS NULL OR c.available = :available)")
    Page<Car> filterCars(@Param("type") String type,
                         @Param("location") String location,
                         @Param("minPrice") BigDecimal minPrice,
                         @Param("maxPrice") BigDecimal maxPrice,
                         @Param("available") Boolean available,
                         Pageable pageable);
}
