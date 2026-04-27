package com.autocare.backend.repository;

import com.autocare.backend.model.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT j FROM JobCard j LEFT JOIN FETCH j.services LEFT JOIN FETCH j.items LEFT JOIN FETCH j.customer c LEFT JOIN FETCH c.user ORDER BY j.startTime DESC")
    List<JobCard> findAllWithDetails();
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT j FROM JobCard j LEFT JOIN FETCH j.services LEFT JOIN FETCH j.items LEFT JOIN FETCH j.customer c LEFT JOIN FETCH c.user WHERE j.customer.id = :customerId ORDER BY j.startTime DESC")
    List<JobCard> findByCustomerIdWithDetails(@org.springframework.data.repository.query.Param("customerId") Long customerId);
    