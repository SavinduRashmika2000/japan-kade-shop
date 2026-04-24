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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "stock_item_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"batches", "category", "supplier"})
    @lombok.EqualsAndHashCode.Exclude
    private StockItem stockItem;

    @Column(nullable = false)
    private Integer initialQuantity;

    @Column(nullable = false)
    private Integer currentQuantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    private BigDecimal unitCostForeign;
    private BigDecimal exchangeRate;
    private String currencyType;
    private BigDecimal freightCost;
    private BigDecimal shippingCost;
    private BigDecimal bankCharges;
    private BigDecimal clearanceFees;
    private BigDecimal dutyFees;
    private BigDecimal additionalExpenses;
    private BigDecimal landedCost;
    private BigDecimal sellingPrice;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false)
    private Boolean isRestored = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StockItem getStockItem() { return stockItem; }
    public void setStockItem(StockItem stockItem) { this.stockItem = stockItem; }
    public Integer getInitialQuantity() { return initialQuantity; }
    public void setInitialQuantity(Integer initialQuantity) { this.initialQuantity = initialQuantity; }
    public Integer getCurrentQuantity() { return currentQuantity; }
    public void setCurrentQuantity(Integer currentQuantity) { this.currentQuantity = currentQuantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getUnitCostForeign() { return unitCostForeign; }
    public void setUnitCostForeign(BigDecimal unitCostForeign) { this.unitCostForeign = unitCostForeign; }
    public BigDecimal getExchangeRate() { return exchangeRate; }
    public void setExchangeRate(BigDecimal exchangeRate) { this.exchangeRate = exchangeRate; }
    public String getCurrencyType() { return currencyType; }
    public void setCurrencyType(String currencyType) { this.currencyType = currencyType; }
    public BigDecimal getFreightCost() { return freightCost; }
    public void setFreightCost(BigDecimal freightCost) { this.freightCost = freightCost; }
    public BigDecimal getShippingCost() { return shippingCost; }
    public void setShippingCost(BigDecimal shippingCost) { this.shippingCost = shippingCost; }
    public BigDecimal getBankCharges() { return bankCharges; }
    public void setBankCharges(BigDecimal bankCharges) { this.bankCharges = bankCharges; }
    public BigDecimal getClearanceFees() { return clearanceFees; }
    public void setClearanceFees(BigDecimal clearanceFees) { this.clearanceFees = clearanceFees; }
    public BigDecimal getDutyFees() { return dutyFees; }
    public void setDutyFees(BigDecimal dutyFees) { this.dutyFees = dutyFees; }
    public BigDecimal getAdditionalExpenses() { return additionalExpenses; }
    public void setAdditionalExpenses(BigDecimal additionalExpenses) { this.additionalExpenses = additionalExpenses; }
    public BigDecimal getLandedCost() { return landedCost; }
    public void setLandedCost(BigDecimal landedCost) { this.landedCost = landedCost; }
    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public Boolean getIsRestored() { return isRestored; }
    public void setIsRestored(Boolean restored) { isRestored = restored; }
}
