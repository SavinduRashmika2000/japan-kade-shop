package com.autocare.backend.service;

import com.autocare.backend.model.*;
import com.autocare.backend.exception.InvalidJobStateException;
import com.autocare.backend.repository.JobCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JobCardService {
    private static final Logger log = LoggerFactory.getLogger(JobCardService.class);

    @Autowired
    private JobCardRepository jobCardRepository;

    @Autowired
    private StockItemService stockService;

    @Autowired
    private StockRetryService stockRetryService;

    @Autowired
    private com.autocare.backend.repository.JobLogRepository jobLogRepository;

    @Autowired
    private com.autocare.backend.repository.CustomerRepository customerRepository;

    @Autowired
    private com.autocare.backend.repository.UserRepository userRepository;

    /**
     * Resolves the full name of the currently authenticated user.
     * Falls back to "System" if no authentication context is present.
     */
    private String getCurrentUserFullName() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                return userRepository.findByUsername(username)
                        .map(user -> {
                            if (user.getName() != null && !user.getName().trim().isEmpty()) {
                                return user.getName();
                            }
                            return username;
                        })
                        .orElse(username);
            }
        } catch (Exception ignored) {}
        return "System";
    }

    private void createLog(JobCard job, String action, String details) {
        try {
            com.autocare.backend.model.JobLog log = new com.autocare.backend.model.JobLog();
            log.setJobId(job.getId());
            log.setVehicleNumber(job.getVehicleNumber());
            
            String customerName = "Unknown";
            if (job.getCustomer() != null) {
                Customer c = job.getCustomer();
                if (c.getUser() == null || c.getFirstName() == null) {
                    c = customerRepository.findById(c.getId()).orElse(c);
                }
                if (c.getUser() != null && c.getUser().getName() != null && !c.getUser().getName().trim().isEmpty()) {
                    customerName = c.getUser().getName();
                } else {
                    String fName = c.getFirstName() != null ? c.getFirstName() : "";
                    String lName = c.getLastName() != null ? c.getLastName() : "";
                    String fullName = (fName + " " + lName).trim();
                    if (!fullName.isEmpty()) {
                        customerName = fullName;