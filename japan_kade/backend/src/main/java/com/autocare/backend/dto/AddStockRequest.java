package com.autocare.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class AddStockRequest {
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;

    private Long supplierId;

    private String hsCode;
    private String currencyType;
    private BigDecimal unitCostForeign;
    private BigDecimal exchangeRate;
    private BigDecimal freightCost;
    private BigDecimal shippingCost;
    private BigDecimal bankCharges;
    private BigDecimal clearanceFees;
    private BigDecimal dutyFees;
    private BigDecimal additionalExpenses;
    private BigDecimal landedCost;
    private BigDecimal sellingPrice;

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getHsCode() { return hsCode; }
    public void setHsCode(String hsCode) { this.hsCode = hsCode; }
    public String getCurrencyType() { return currencyType; }
    public void setCurrencyType(String currencyType) { this.currencyType = currencyType; }
    public BigDecimal getUnitCostForeign() { return unitCostForeign; }
    public void setUnitCostForeign(BigDecimal unitCostForeign) { this.unitCostForeign = unitCostForeign; }
    public BigDecimal getExchangeRate() { return exchangeRate; }
    public void setExchangeRate(BigDecimal exchangeRate) { this.exchangeRate = exchangeRate; }
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
}
