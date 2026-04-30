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