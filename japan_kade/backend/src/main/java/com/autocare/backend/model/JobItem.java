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