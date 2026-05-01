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
                    }
                }
            }
            log.setCustomerName(customerName);
            
            log.setAction(action);
            log.setDetails(details);
            log.setPerformedBy(getCurrentUserFullName());
            jobLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to create job log: " + e.getMessage());
        }
    }

    private void validateStatusTransition(JobCard.JobStatus oldStatus, JobCard.JobStatus newStatus) {
        if (oldStatus == JobCard.JobStatus.PAID || oldStatus == JobCard.JobStatus.CANCELLED) {
            throw new InvalidJobStateException("Cannot change status of a " + oldStatus + " job.");
        }

        boolean valid = false;
        if (oldStatus == JobCard.JobStatus.WAITING) {
            if (newStatus == JobCard.JobStatus.PAID || newStatus == JobCard.JobStatus.CANCELLED) {
                valid = true;
            }
        }

        if (!valid) {
            throw new InvalidJobStateException("Invalid transition from " + oldStatus + " to " + newStatus);
        }
    }

    public List<JobCard> getAllJobs() {
        return jobCardRepository.findAllWithDetails();
    }

    public List<JobCard> getMyJobs() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                User user = userRepository.findByUsername(username).orElse(null);
                if (user != null) {
                    Customer customer = customerRepository.findByUser(user).orElse(null);
                    if (customer != null) {
                        return jobCardRepository.findByCustomerIdWithDetails(customer.getId());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to get customer jobs", e);
        }
        return new ArrayList<>();
    }

    public JobCard getJobById(Long id) {
        return jobCardRepository.findByIdWithDetails(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @Transactional
    public JobCard saveJob(JobCard jobCard) {
        JobCard entityToSave;
        java.util.Set<JobItem> oldItems = new java.util.HashSet<>();
        JobCard.JobStatus oldStatus = null;
        
        if (jobCard.getId() != null) {
            // UPDATE FLOW
            entityToSave = jobCardRepository.findById(jobCard.getId())
                    .orElseThrow(() -> new RuntimeException("Job card not found with ID: " + jobCard.getId()));
            
            oldStatus = entityToSave.getStatus();
            // Clone old items for stock restoration logic before we clear the collection
            oldItems = new java.util.HashSet<>(entityToSave.getItems());
            
            // Restore stock for ANY active job being re-evaluated (reservation logic)
            if (oldStatus != JobCard.JobStatus.CANCELLED) {
                System.out.println("DEBUG: Restoring stock for " + oldItems.size() + " old items from Job #" + entityToSave.getId());
                restoreStockForItems(entityToSave, oldItems, "Job #" + entityToSave.getId() + " Update (Re-evaluating)");
            }

            entityToSave.setVehicleNumber(jobCard.getVehicleNumber());
            entityToSave.setStartTime(jobCard.getStartTime());
            entityToSave.setEndTime(jobCard.getEndTime());
            entityToSave.setStatus(jobCard.getStatus());
            
            if (jobCard.getCustomer() != null && jobCard.getCustomer().getId() != null) {
                Customer customer = customerRepository.findById(jobCard.getCustomer().getId())
                        .orElseThrow(() -> new RuntimeException("Customer not found"));
                entityToSave.setCustomer(customer);
            }
            
            entityToSave.getServices().clear();
            if (jobCard.getServices() != null) {
                for (JobService js : jobCard.getServices()) {
                    js.setJobCard(entityToSave);
                    entityToSave.getServices().add(js);
                }
            }
            
            entityToSave.getItems().clear();
            if (jobCard.getItems() != null) {
                for (JobItem ji : jobCard.getItems()) {
                    ji.setJobCard(entityToSave);
                    entityToSave.getItems().add(ji);
                }
            }
        } else {
            // CREATE FLOW
            entityToSave = jobCard;
            if (entityToSave.getServices() != null) {
                entityToSave.getServices().forEach(s -> s.setJobCard(entityToSave));
            }
            if (entityToSave.getItems() != null) {
                entityToSave.getItems().forEach(i -> i.setJobCard(entityToSave));
            }
        }

        // Calculate totals
        BigDecimal total = BigDecimal.ZERO;
        if (entityToSave.getServices() != null) {
            for (JobService js : entityToSave.getServices()) {
                if (js.getPriceAtTime() != null) total = total.add(js.getPriceAtTime());
            }
        }
        if (entityToSave.getItems() != null) {
            for (JobItem ji : entityToSave.getItems()) {
                if (ji.getPriceAtTime() != null && ji.getQuantity() != null) {
                    total = total.add(ji.getPriceAtTime().multiply(new BigDecimal(ji.getQuantity())));
                }
            }
        }
        entityToSave.setTotalAmount(total);
        
        JobCard saved = jobCardRepository.save(entityToSave);
        JobCard.JobStatus newStatus = saved.getStatus();

        // Reserve stock immediately for any non-cancelled job
        if (newStatus != JobCard.JobStatus.CANCELLED) {
            System.out.println("DEBUG: Reserving stock for Job #" + saved.getId());
            reduceStockForItems(saved, "Job #" + saved.getId() + (jobCard.getId() == null ? " Created" : " Updated"));
            
            // Recalculate total after stock reduction (multi-batch pricing update)
            BigDecimal finalTotal = BigDecimal.ZERO;
            if (saved.getServices() != null) {
                for (JobService js : saved.getServices()) {
                    if (js.getPriceAtTime() != null) finalTotal = finalTotal.add(js.getPriceAtTime());
                }
            }
            if (saved.getItems() != null) {
                for (JobItem ji : saved.getItems()) {
                    if (ji.getSubtotal() != null) {
                        finalTotal = finalTotal.add(ji.getSubtotal());
                    } else if (ji.getPriceAtTime() != null && ji.getQuantity() != null) {
                        finalTotal = finalTotal.add(ji.getPriceAtTime().multiply(new BigDecimal(ji.getQuantity())));
                    }
                }
            }
            saved.setTotalAmount(finalTotal);
            saved = jobCardRepository.save(saved);

            // If saved as PAID immediately, release the reservation since it is fully consumed
            if (newStatus == JobCard.JobStatus.PAID) {
                for (JobItem ji : saved.getItems()) {
                    if (ji.getStockItem() != null && ji.getStockItem().getId() != null && ji.getQuantity() != null && ji.getQuantity() > 0) {
                        stockService.releaseReservation(ji.getStockItem().getId(), ji.getQuantity(), saved.getId());
                    }
                }