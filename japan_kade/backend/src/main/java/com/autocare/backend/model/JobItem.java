package com.autocare.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "job_items", indexes = {
    @Index(name = "idx_job_item_stock_batch_id", columnList = "stock_batch_id")
})
public class JobItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_card_id", nullable = false)
    @JsonIgnore
    @lombok.EqualsAndHashCode.Exclude
    private JobCard jobCard;

    @ManyToOne
    @JoinColumn(name = "stock_item_id", nullable = false)
    @NotNull(message = "Stock item is required")
    private StockItem stockItem;

    @Column(nullable = false)
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    private BigDecimal priceAtTime; // Snapshotted unit price