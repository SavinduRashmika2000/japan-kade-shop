package com.autocare.backend.repository;

import com.autocare.backend.model.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findAllByOrderByTimestampDesc();

    List<StockTransaction> findByTransactionTypeOrderByTimestampDesc(String transactionType);

    List<StockTransaction> findByJobIdOrderByTimestampDesc(Long jobId);

    List<StockTransaction> findByStockItemIdOrderByTimestampDesc(Long stockItemId);

    long countByTransactionType(String transactionType);

    @Modifying
    @Transactional
    @Query("DELETE FROM StockTransaction st WHERE st.jobId = :jobId")
    void deleteByJobId(@Param("jobId") Long jobId);
}
