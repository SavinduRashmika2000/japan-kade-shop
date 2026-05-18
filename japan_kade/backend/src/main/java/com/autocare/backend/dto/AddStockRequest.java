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
