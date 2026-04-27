package com.autocare.backend.repository;

import com.autocare.backend.model.JobCard;
import com.autocare.backend.model.JobItem;
import com.autocare.backend.model.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobItemRepository extends JpaRepository<JobItem, Long> {
    List<JobItem> findByStockItemAndJobCardStatusAndJobCardEndTimeAfter(