package com.autocare.backend.repository;

import com.autocare.backend.model.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, Long> {

    @Transactional
    @Modifying
    @Query(value = "UPDATE stock_items SET category_id = NULL WHERE category_id = :categoryId", nativeQuery = true)
    void nullifyCategoryRelations(@Param("categoryId") Long categoryId);

    @Query("SELECT DISTINCT s FROM StockItem s LEFT JOIN FETCH s.category LEFT JOIN FETCH s.supplier")
    java.util.List<StockItem> findAllWithDetails();

    @Query("SELECT s FROM StockItem s LEFT JOIN FETCH s.category LEFT JOIN FETCH s.supplier WHERE s.id = :id")
    java.util.Optional<StockItem> findByIdWithDetails(@Param("id") Long id);

    @Transactional
    @Modifying
    @Query("UPDATE StockItem s SET s.quantity = :quantity, s.unitPrice = :unitPrice, s.fifoQuantity = :fifoQuantity WHERE s.id = :id")
    void updateStockSummary(@Param("id") Long id,
                             @Param("quantity") Integer quantity,
                             @Param("unitPrice") java.math.BigDecimal unitPrice,
                             @Param("fifoQuantity") Integer fifoQuantity);
}
