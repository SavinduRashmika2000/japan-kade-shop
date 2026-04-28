package com.autocare.backend.repository;

import com.autocare.backend.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    java.util.Optional<Staff> findByUser(com.autocare.backend.model.User user);
    boolean existsByIdNo(String idNo);
}
