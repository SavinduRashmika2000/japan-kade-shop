package com.autocare.backend.repository;

import com.autocare.backend.model.StockBatch;
import com.autocare.backend.model.StockItem;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockBatchRepository extends JpaRepository<StockBatch, Long> {
    List<StockBatch> findByStockItemOrderByCreatedAtAsc(StockItem stockItem);