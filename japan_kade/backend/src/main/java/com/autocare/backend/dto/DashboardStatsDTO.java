package com.autocare.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DashboardStatsDTO {
    private BigDecimal todayRevenue;
    private BigDecimal totalRevenue;
    private long activeJobs;
    private long totalCustomers;
    private long totalStaff;
    private long totalServices;

    // Inventory Intelligence & Excel Reporting
    private BigDecimal totalInventoryValue;
    private BigDecimal remainingStockValue;
    private BigDecimal estimatedSellingValue;
    private BigDecimal estimatedFutureProfit;
    private BigDecimal monthlyRevenue;
    private BigDecimal monthlyInventoryProfit;
    
    // Import Cost Analytics (Aggregated)
    private BigDecimal totalFreightCost;
    private BigDecimal totalShippingCost;
    private BigDecimal totalBankCharges;
    private BigDecimal totalClearanceFees;
    private BigDecimal totalDutyFees;
    private BigDecimal totalAdditionalExpenses;
    
    private long lowStockCount;