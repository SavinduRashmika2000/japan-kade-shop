package com.autocare.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StockItem extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String partNumber;

    private String hsCode;

    @Column(length = 500)
    private String remarks;

    private String location;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer reservedQuantity = 0; // Tracks stock assigned to active jobs

    private Integer fifoQuantity; // Quantity of the oldest available batch for UI display

    private Integer lowStockThreshold;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "stockItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<StockBatch> batches;

    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
    private java.time.LocalDateTime lastRestockedAt;

    private boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = java.time.LocalDateTime.now();
        if (reservedQuantity == null) reservedQuantity = 0;
    }

    /** @return true if available quantity is at or below the low-stock threshold */
    public boolean isLowStock() {
        if (lowStockThreshold == null || quantity == null) return false;
        return quantity <= lowStockThreshold;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPartNumber() { return partNumber; }
    public void setPartNumber(String partNumber) { this.partNumber = partNumber; }
    public String getHsCode() { return hsCode; }
    public void setHsCode(String hsCode) { this.hsCode = hsCode; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Integer getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(Integer reservedQuantity) { this.reservedQuantity = reservedQuantity; }
    public Integer getAvailableQuantity() { return quantity != null ? quantity : 0; }
    public Integer getFifoQuantity() { return fifoQuantity; }
    public void setFifoQuantity(Integer fifoQuantity) { this.fifoQuantity = fifoQuantity; }
    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public java.util.List<StockBatch> getBatches() { return batches; }
    public void setBatches(java.util.List<StockBatch> batches) { this.batches = batches; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public java.time.LocalDateTime getLastRestockedAt() { return lastRestockedAt; }
    public void setLastRestockedAt(java.time.LocalDateTime lastRestockedAt) { this.lastRestockedAt = lastRestockedAt; }
}
