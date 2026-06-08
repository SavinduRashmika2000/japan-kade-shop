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
    @Query("SELECT b FROM StockBatch b LEFT JOIN FETCH b.stockItem LEFT JOIN FETCH b.supplier WHERE b.stockItem = :stockItem ORDER BY b.createdAt ASC")
    List<StockBatch> findByStockItemOrderByCreatedAtAsc(@Param("stockItem") StockItem stockItem);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
    @Query("SELECT b FROM StockBatch b WHERE b.stockItem = :stockItem AND b.currentQuantity > 0 ORDER BY b.createdAt ASC")
    List<StockBatch> findAvailableBatchesForUpdate(@Param("stockItem") StockItem stockItem);
    
    List<StockBatch> findByStockItemAndCurrentQuantityGreaterThanOrderByCreatedAtAsc(StockItem stockItem, Integer currentQuantity);

    // Non-locking read for simulation/preview purposes only
    @Query("SELECT b FROM StockBatch b WHERE b.stockItem = :stockItem AND b.currentQuantity > 0 ORDER BY b.createdAt ASC")
    List<StockBatch> findAvailableBatchesReadOnly(@Param("stockItem") StockItem stockItem);
    List<StockBatch> findByStockItemOrderByIsRestoredDescCreatedAtAsc(StockItem stockItem);
    
    List<StockBatch> findByCurrentQuantityGreaterThan(Integer currentQuantity);

    // Bulk fetch all active batches across ALL items in one query (for efficient sync)
    @Query("SELECT b FROM StockBatch b WHERE b.currentQuantity > 0 ORDER BY b.stockItem.id ASC, b.createdAt ASC")
    List<StockBatch> findAllActiveBatchesOrdered();
}
