package com.autocare.backend.repository;

import com.autocare.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Boolean existsByLicensePlate(String licensePlate);
}
