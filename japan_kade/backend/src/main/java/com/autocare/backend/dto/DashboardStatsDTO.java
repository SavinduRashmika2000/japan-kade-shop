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
    private long outOfStockCount;
    
    private List<ChartDataDTO> chartData;
    private List<TopItemDTO> topItems;
    private List<TopServiceDTO> topServices;
    private List<TopCustomerDTO> topCustomers;
    private List<RecentActivityDTO> recentActivity;
    
    // Explicit Getters/Setters for ALL fields to resolve Lombok issues
    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }
    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
    public long getTotalStaff() { return totalStaff; }
    public void setTotalStaff(long totalStaff) { this.totalStaff = totalStaff; }
    public long getTotalServices() { return totalServices; }
    public void setTotalServices(long totalServices) { this.totalServices = totalServices; }
    
    public BigDecimal getTotalInventoryValue() { return totalInventoryValue; }
    public void setTotalInventoryValue(BigDecimal val) { this.totalInventoryValue = val; }
    public BigDecimal getRemainingStockValue() { return remainingStockValue; }
    public void setRemainingStockValue(BigDecimal val) { this.remainingStockValue = val; }
    public BigDecimal getEstimatedSellingValue() { return estimatedSellingValue; }
    public void setEstimatedSellingValue(BigDecimal val) { this.estimatedSellingValue = val; }
    public BigDecimal getEstimatedFutureProfit() { return estimatedFutureProfit; }
    public void setEstimatedFutureProfit(BigDecimal val) { this.estimatedFutureProfit = val; }
    public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(BigDecimal val) { this.monthlyRevenue = val; }
    public BigDecimal getMonthlyInventoryProfit() { return monthlyInventoryProfit; }