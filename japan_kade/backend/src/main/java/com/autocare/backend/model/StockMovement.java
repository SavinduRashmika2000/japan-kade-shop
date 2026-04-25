package com.autocare.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements", 
    indexes = {
        @Index(name = "idx_stock_movement_item_id", columnList = "stock_item_id"),
        @Index(name = "idx_stock_movement_reference_id", columnList = "reference_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"reference_id", "stock_batch_id", "type"})
    }
)
@Data
@lombok.EqualsAndHashCode(callSuper = true)
public class StockMovement extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_item_id", nullable = false)
    @lombok.EqualsAndHashCode.Exclude
    private StockItem stockItem;

    @Column(name = "stock_batch_id")
    private Long stockBatchId;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType type;

    @Column(name = "reference_id")
    private Long referenceId; // jobId

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StockItem getStockItem() { return stockItem; }
    public void setStockItem(StockItem stockItem) { this.stockItem = stockItem; }
    public Long getStockBatchId() { return stockBatchId; }
    public void setStockBatchId(Long stockBatchId) { this.stockBatchId = stockBatchId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public MovementType getType() { return type; }
    public void setType(MovementType type) { this.type = type; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public enum MovementType {
        RESERVE,
        CONSUME,
        RESTORE
    }
}
