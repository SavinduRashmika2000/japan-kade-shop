package com.autocare.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Table(name = "stock_items")
@SQLDelete(sql = "UPDATE stock_items SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
@Data
@lombok.EqualsAndHashCode(callSuper = true)
public class StockItem extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String partNumber;

    private String hsCode;

    @Column(nullable = false)