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