package com.autocare.backend.repository;

import com.autocare.backend.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    boolean existsByReferenceIdAndStockBatchIdAndType(Long referenceId, Long stockBatchId, StockMovement.MovementType type);
}
