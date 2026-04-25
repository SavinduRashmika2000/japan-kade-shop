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