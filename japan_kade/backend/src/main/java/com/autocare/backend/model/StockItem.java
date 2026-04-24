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
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer reservedQuantity = 0; // Tracks stock assigned to active jobs

    private Integer fifoQuantity; // Quantity of the oldest available batch for UI display

    private Integer lowStockThreshold;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "stockItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<StockBatch> batches;

    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
    private java.time.LocalDateTime lastRestockedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPartNumber() { return partNumber; }
    public void setPartNumber(String partNumber) { this.partNumber = partNumber; }
    public String getHsCode() { return hsCode; }
    public void setHsCode(String hsCode) { this.hsCode = hsCode; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Integer getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(Integer reservedQuantity) { this.reservedQuantity = reservedQuantity; }
    public Integer getAvailableQuantity() { return quantity != null ? quantity : 0; }
    public Integer getFifoQuantity() { return fifoQuantity; }
    public void setFifoQuantity(Integer fifoQuantity) { this.fifoQuantity = fifoQuantity; }