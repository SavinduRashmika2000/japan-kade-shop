package com.autocare.backend.service;

import com.autocare.backend.dto.DashboardStatsDTO;
import com.autocare.backend.model.JobCard;
import com.autocare.backend.model.JobItem;
import com.autocare.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private JobCardRepository jobCardRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private com.autocare.backend.repository.UserRepository userRepository;

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    @Autowired
    private StockItemRepository stockItemRepository;

    @Autowired
    private StockBatchRepository stockBatchRepository;

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);

        // Basic Counts
        stats.setTotalCustomers(customerRepository.count());
        stats.setTotalStaff(userRepository.countByRoleIn(List.of(
                com.autocare.backend.model.RoleType.ROLE_ADMIN,
                com.autocare.backend.model.RoleType.ROLE_STAFF
        )));
        stats.setTotalServices(serviceTypeRepository.count());
        
        List<JobCard> allJobs = jobCardRepository.findAllWithDetails(); 

        stats.setActiveJobs(allJobs.stream()
                .filter(j -> j.getStatus() != JobCard.JobStatus.PAID && j.getStatus() != JobCard.JobStatus.CANCELLED)
                .count());

        stats.setTodayRevenue(allJobs.stream()
                .filter(j -> j.getStatus() == JobCard.JobStatus.PAID && j.getStartTime().isAfter(startOfToday) && j.getStartTime().isBefore(endOfToday))
                .map(JobCard::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        stats.setTotalRevenue(allJobs.stream()
                .filter(j -> j.getStatus() == JobCard.JobStatus.PAID)
                .map(JobCard::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        // Last 7 Days Chart Data
        List<DashboardStatsDTO.ChartDataDTO> chartData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);

            DashboardStatsDTO.ChartDataDTO data = new DashboardStatsDTO.ChartDataDTO();
            data.setDate(date.toString());
            
            data.setRevenue(allJobs.stream()
                    .filter(j -> j.getStatus() == JobCard.JobStatus.PAID && j.getStartTime().isAfter(start) && j.getStartTime().isBefore(end))
                    .map(JobCard::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            
            data.setJobs(allJobs.stream()
                    .filter(j -> j.getStartTime().isAfter(start) && j.getStartTime().isBefore(end))
                    .count());
            
            chartData.add(data);
        }
        stats.setChartData(chartData);

        // Recent Activity (Last 5 jobs)
        stats.setRecentActivity(allJobs.stream()
                .sorted((j1, j2) -> j2.getStartTime().compareTo(j1.getStartTime()))
                .limit(5)
                .map(j -> {
                    DashboardStatsDTO.RecentActivityDTO dto = new DashboardStatsDTO.RecentActivityDTO();
                    dto.setId(j.getId());
                    dto.setVehicleNumber(j.getVehicleNumber());
                    String customerName = "Walk-in";
                    if (j.getCustomer() != null) {
                        customerName = j.getCustomer().getFirstName() + " " + (j.getCustomer().getLastName() != null ? j.getCustomer().getLastName() : "");
                    }
                    dto.setCustomerName(customerName);
                    dto.setStatus(j.getStatus().toString());
                    return dto;
                })
                .collect(Collectors.toList()));

        // Top Services & Items calculation
        // Top 5 Services
        stats.setTopServices(allJobs.stream()
                .filter(j -> j.getStatus() == JobCard.JobStatus.PAID)
                .flatMap(j -> j.getServices().stream())
                .collect(Collectors.groupingBy(com.autocare.backend.model.JobService::getServiceName, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    DashboardStatsDTO.TopServiceDTO dto = new DashboardStatsDTO.TopServiceDTO();
                    dto.setName(e.getKey());
                    dto.setCount(e.getValue());
                    return dto;
                })
                .collect(Collectors.toList()));

        // Top 5 Items
        stats.setTopItems(allJobs.stream()
                .filter(j -> j.getStatus() == JobCard.JobStatus.PAID)
                .flatMap(j -> j.getItems().stream())
                .collect(Collectors.groupingBy(com.autocare.backend.model.JobItem::getItemName, Collectors.summingLong(com.autocare.backend.model.JobItem::getQuantity)))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    DashboardStatsDTO.TopItemDTO dto = new DashboardStatsDTO.TopItemDTO();
                    dto.setName(e.getKey());
                    dto.setQty(e.getValue());
                    return dto;
                })
                .collect(Collectors.toList()));

        // Top 4 Customers (by revenue)
        stats.setTopCustomers(allJobs.stream()
                .filter(j -> j.getStatus() == JobCard.JobStatus.PAID && j.getCustomer() != null)
                .collect(Collectors.groupingBy(j -> j.getCustomer().getFirstName() + " " + (j.getCustomer().getLastName() != null ? j.getCustomer().getLastName() : ""),
                        Collectors.mapping(j -> j, Collectors.toList())))
                .entrySet().stream()
                .map(e -> {
                    DashboardStatsDTO.TopCustomerDTO dto = new DashboardStatsDTO.TopCustomerDTO();
                    dto.setName(e.getKey());
                    dto.setTotal(e.getValue().stream().map(JobCard::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
                    dto.setJobs(e.getValue().size());
                    return dto;
                })
                .sorted((c1, c2) -> c2.getTotal().compareTo(c1.getTotal()))
                .limit(4)
                .collect(Collectors.toList()));

        // Time-based stats (Monthly)
        java.time.LocalDateTime lastMonth = java.time.LocalDateTime.now().minusDays(30);
        java.util.List<JobCard> monthlyJobs = allJobs.stream()
            .filter(j -> j.getStatus() == JobCard.JobStatus.PAID && j.getEndTime() != null && j.getEndTime().isAfter(lastMonth))
            .collect(Collectors.toList());

        stats.setMonthlyRevenue(monthlyJobs.stream()
            .map(JobCard::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add));

        // Monthly Inventory Profit & Intelligence
        BigDecimal monthlyProfit = BigDecimal.ZERO;
        BigDecimal totalStockValue = BigDecimal.ZERO; // Remaining Qty * Landed Cost
        BigDecimal totalSellingValue = BigDecimal.ZERO; // Remaining Qty * Selling Price
        BigDecimal totalFutureProfit = BigDecimal.ZERO; // Remaining Qty * GP
        
        BigDecimal totalFreight = BigDecimal.ZERO;
        BigDecimal totalShipping = BigDecimal.ZERO;
        BigDecimal totalBank = BigDecimal.ZERO;
        BigDecimal totalClearance = BigDecimal.ZERO;
        BigDecimal totalDuty = BigDecimal.ZERO;
        BigDecimal totalAddtl = BigDecimal.ZERO;

        // 1. Calculate Monthly Profit from PAID jobs (Optimized: fetch all relevant batches in one go)
        java.util.Set<Long> batchIdsToFetch = monthlyJobs.stream()
            .flatMap(j -> j.getItems().stream())
            .map(com.autocare.backend.model.JobItem::getStockBatchId)
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toSet());
            
        java.util.Map<Long, com.autocare.backend.model.StockBatch> batchMap = stockBatchRepository.findAllById(batchIdsToFetch).stream()
            .collect(Collectors.toMap(com.autocare.backend.model.StockBatch::getId, b -> b));

        for (JobCard job : monthlyJobs) {
            for (JobItem item : job.getItems()) {
                if (item.getStockBatchId() != null) {
                    com.autocare.backend.model.StockBatch batch = batchMap.get(item.getStockBatchId());
                    if (batch != null) {
                        BigDecimal landedCost = batch.getLandedCost() != null ? batch.getLandedCost() : (batch.getUnitPrice() != null ? batch.getUnitPrice() : BigDecimal.ZERO);
                        BigDecimal sellingPrice = batch.getSellingPrice() != null ? batch.getSellingPrice() : (item.getPriceAtTime() != null ? item.getPriceAtTime() : landedCost);
                        BigDecimal profitPerUnit = sellingPrice.subtract(landedCost);
                        monthlyProfit = monthlyProfit.add(profitPerUnit.multiply(new BigDecimal(item.getQuantity() != null ? item.getQuantity() : 0)));
                    }
                }
            }
        }
        stats.setMonthlyInventoryProfit(monthlyProfit.setScale(2, RoundingMode.HALF_UP));

        // 2. Inventory Valuation & Intelligence (Per Batch accuracy)
        java.util.List<com.autocare.backend.model.StockBatch> activeBatches = stockBatchRepository.findByCurrentQuantityGreaterThan(0);
        for (com.autocare.backend.model.StockBatch b : activeBatches) {
            BigDecimal qty = new BigDecimal(b.getCurrentQuantity() != null ? b.getCurrentQuantity() : 0);
            BigDecimal landed = b.getLandedCost() != null ? b.getLandedCost() : (b.getUnitPrice() != null ? b.getUnitPrice() : BigDecimal.ZERO);
            BigDecimal selling = b.getSellingPrice() != null ? b.getSellingPrice() : (b.getUnitPrice() != null ? b.getUnitPrice() : BigDecimal.ZERO);
            
            totalStockValue = totalStockValue.add(landed.multiply(qty));
            totalSellingValue = totalSellingValue.add(selling.multiply(qty));
            totalFutureProfit = totalFutureProfit.add(selling.subtract(landed).multiply(qty));

            totalFreight = totalFreight.add(b.getFreightCost() != null ? b.getFreightCost() : BigDecimal.ZERO);
            totalShipping = totalShipping.add(b.getShippingCost() != null ? b.getShippingCost() : BigDecimal.ZERO);
            totalBank = totalBank.add(b.getBankCharges() != null ? b.getBankCharges() : BigDecimal.ZERO);
            totalClearance = totalClearance.add(b.getClearanceFees() != null ? b.getClearanceFees() : BigDecimal.ZERO);
            totalDuty = totalDuty.add(b.getDutyFees() != null ? b.getDutyFees() : BigDecimal.ZERO);
            totalAddtl = totalAddtl.add(b.getAdditionalExpenses() != null ? b.getAdditionalExpenses() : BigDecimal.ZERO);
        }

        stats.setTotalInventoryValue(totalStockValue.setScale(2, RoundingMode.HALF_UP));
        stats.setRemainingStockValue(totalStockValue.setScale(2, RoundingMode.HALF_UP));
        stats.setEstimatedSellingValue(totalSellingValue.setScale(2, RoundingMode.HALF_UP));
        stats.setEstimatedFutureProfit(totalFutureProfit.setScale(2, RoundingMode.HALF_UP));

        stats.setTotalFreightCost(totalFreight.setScale(2, RoundingMode.HALF_UP));
        stats.setTotalShippingCost(totalShipping.setScale(2, RoundingMode.HALF_UP));
        stats.setTotalBankCharges(totalBank.setScale(2, RoundingMode.HALF_UP));
        stats.setTotalClearanceFees(totalClearance.setScale(2, RoundingMode.HALF_UP));
        stats.setTotalDutyFees(totalDuty.setScale(2, RoundingMode.HALF_UP));
        stats.setTotalAdditionalExpenses(totalAddtl.setScale(2, RoundingMode.HALF_UP));

        // Inventory Alerts
        java.util.List<com.autocare.backend.model.StockItem> allStock = stockItemRepository.findAll();
        stats.setLowStockCount(allStock.stream()
            .filter(s -> s.getLowStockThreshold() != null && s.getQuantity() != null
                && s.getQuantity() > 0 && s.getQuantity() <= s.getLowStockThreshold())
            .count());
        stats.setOutOfStockCount(allStock.stream()
            .filter(s -> s.getQuantity() != null && s.getQuantity() == 0)
            .count());

        return stats;
    }
}
