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
    public void setMonthlyInventoryProfit(BigDecimal val) { this.monthlyInventoryProfit = val; }
    
    public BigDecimal getTotalFreightCost() { return totalFreightCost; }
    public void setTotalFreightCost(BigDecimal val) { this.totalFreightCost = val; }
    public BigDecimal getTotalShippingCost() { return totalShippingCost; }
    public void setTotalShippingCost(BigDecimal val) { this.totalShippingCost = val; }
    public BigDecimal getTotalBankCharges() { return totalBankCharges; }
    public void setTotalBankCharges(BigDecimal val) { this.totalBankCharges = val; }
    public BigDecimal getTotalClearanceFees() { return totalClearanceFees; }
    public void setTotalClearanceFees(BigDecimal val) { this.totalClearanceFees = val; }
    public BigDecimal getTotalDutyFees() { return totalDutyFees; }
    public void setTotalDutyFees(BigDecimal val) { this.totalDutyFees = val; }
    public BigDecimal getTotalAdditionalExpenses() { return totalAdditionalExpenses; }
    public void setTotalAdditionalExpenses(BigDecimal val) { this.totalAdditionalExpenses = val; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }
    public long getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(long outOfStockCount) { this.outOfStockCount = outOfStockCount; }

    public List<TopCustomerDTO> getTopCustomers() { return topCustomers; }
    public void setTopCustomers(List<TopCustomerDTO> topCustomers) { this.topCustomers = topCustomers; }
    public List<TopItemDTO> getTopItems() { return topItems; }
    public void setTopItems(List<TopItemDTO> topItems) { this.topItems = topItems; }
    public List<TopServiceDTO> getTopServices() { return topServices; }
    public void setTopServices(List<TopServiceDTO> topServices) { this.topServices = topServices; }
    public List<ChartDataDTO> getChartData() { return chartData; }
    public void setChartData(List<ChartDataDTO> chartData) { this.chartData = chartData; }
    public List<RecentActivityDTO> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<RecentActivityDTO> recentActivity) { this.recentActivity = recentActivity; }

    @Data
    public static class ChartDataDTO {
        private String date;
        private BigDecimal revenue;
        private long jobs;

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        public long getJobs() { return jobs; }
        public void setJobs(long jobs) { this.jobs = jobs; }
    }

    @Data
    public static class TopItemDTO {
        private String name;
        private long qty;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getQty() { return qty; }
        public void setQty(long qty) { this.qty = qty; }
    }

    @Data
    public static class TopServiceDTO {
        private String name;
        private long count;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }