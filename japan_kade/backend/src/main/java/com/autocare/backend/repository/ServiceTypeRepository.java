package com.autocare.backend.repository;

import com.autocare.backend.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {
    List<ServiceType> findByNameContainingIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
