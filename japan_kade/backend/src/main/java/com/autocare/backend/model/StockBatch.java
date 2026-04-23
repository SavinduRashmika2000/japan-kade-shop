package com.autocare.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_batches", indexes = {
    @Index(name = "idx_stock_batch_item_id", columnList = "stock_item_id"),
    @Index(name = "idx_stock_batch_created_at", columnList = "created_at")
})
@Data
@lombok.EqualsAndHashCode(callSuper = true)
public class StockBatch extends BaseAuditEntity {
    @Id