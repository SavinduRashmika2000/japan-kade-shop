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
            }
        }

        // Audit Logging
        if (newStatus == JobCard.JobStatus.CANCELLED) {
            // Remove ALL prior logs for this job — only the cancellation record should remain.
            // clearAutomatically=true on the repo method evicts JPA cache after delete.
            jobLogRepository.deleteByJobId(saved.getId());
            // Mark stock as restored so updateStatus cannot double-restore
            saved.setStockRestored(true);
            saved = jobCardRepository.save(saved);
        }

        String detail = (newStatus == JobCard.JobStatus.CANCELLED)
            ? "Job cancelled. Inventory restored."
            : "Status: " + newStatus + " | Total: Rs. " + saved.getTotalAmount();

        String logAction = (jobCard.getId() == null) ? "JOB_CREATED" : (newStatus == JobCard.JobStatus.CANCELLED ? "JOB_CANCELLED" : "JOB_UPDATED");
        createLog(saved, logAction, detail);

        return saved;
    }

    private void reduceStockForItems(JobCard job, String reason) {
        if (job.getItems() == null || job.getItems().isEmpty()) return;
        
        // Use a temporary list to avoid concurrent modification or Set identity issues during mutation
        java.util.List<JobItem> currentItems = new java.util.ArrayList<>(job.getItems());
        java.util.List<JobItem> finalizedItems = new java.util.ArrayList<>();
        
        for (JobItem ji : currentItems) {
            if (ji.getStockItem() != null && ji.getStockItem().getId() != null && ji.getQuantity() != null && ji.getQuantity() > 0) {
                log.info("FIFO: Processing allocation for '{}' (Qty: {})", ji.getItemName(), ji.getQuantity());
                StockItemService.ReductionResult result = stockRetryService.retryableReduceStock(ji.getStockItem().getId(), ji.getQuantity(), reason, job.getId());
                
                List<StockItemService.BatchConsumption> allocations = result.allocations;
                if (!allocations.isEmpty()) {
                    // Split the requested item into multiple records based on actual batch consumption
                    for (StockItemService.BatchConsumption allocation : allocations) {
                        JobItem record = new JobItem();
                        record.setJobCard(job);
                        record.setStockItem(ji.getStockItem());
                        record.setItemName(ji.getItemName());
                        record.setQuantity(allocation.qty);
                        record.setPriceAtTime(allocation.unitPrice);
                        record.setSubtotal(allocation.subtotal);
                        record.setStockBatchId(allocation.batchId);
                        finalizedItems.add(record);
                        log.info("FIFO: Allocated {} units from Batch {} at Rs. {}", allocation.qty, allocation.batchId, allocation.unitPrice);
                    }
                }
            } else {
                // Keep non-stock items or invalid items if they somehow exist
                finalizedItems.add(ji);
            }
        }
        
        // Rebuild the set with finalized allocations
        job.getItems().clear();
        job.getItems().addAll(finalizedItems);
    }

    private void logStockOutActivity(JobCard job) {
        // Silenced to keep work activity feed clean
    }

    private void restoreStockForItems(JobCard job, java.util.Set<JobItem> items, String reason) {
        if (items == null || items.isEmpty()) return;
        boolean wasDeductedLogNeeded = (job.getStatus() == JobCard.JobStatus.PAID);
        
        for (JobItem ji : items) {
            if (ji.getStockItem() != null && ji.getStockItem().getId() != null && ji.getQuantity() != null && ji.getQuantity() > 0) {
                if (ji.getStockBatchId() != null) {
                    stockRetryService.retryableRestoreStockToBatch(ji.getStockBatchId(), ji.getStockItem().getId(), ji.getQuantity(), reason, job.getId());
                } else {
                    stockRetryService.retryableRestoreStock(ji.getStockItem().getId(), ji.getQuantity(), reason, job.getId());
                }
            }
        }
        
        // Silenced to keep activity feed clean as items are already listed in JOB_UPDATED/JOB_FINISHED
    }

    @Transactional
    public JobCard updateStatus(Long id, JobCard.JobStatus status) {
        JobCard job = getJobById(id);
        JobCard.JobStatus oldStatus = job.getStatus();
        
        if (oldStatus == status) return job;

        // Enforce strict state machine transitions
        validateStatusTransition(oldStatus, status);
        
        System.out.println("DEBUG: Status Transition for Job #" + id + ": " + oldStatus + " -> " + status);

        // Transition logic for immediate stock reservation (reverted to original robust logic)
        if (status == JobCard.JobStatus.CANCELLED && oldStatus != JobCard.JobStatus.CANCELLED) {
            if (!job.isStockRestored()) {
                System.out.println("DEBUG: Restoring stock for Job #" + id + " (Cancellation)");
                restoreStockForItems(job, job.getItems(), "Job #" + id + " Cancelled");
                // Clean up: delete all stock transaction audit rows tied to this job
                stockService.deleteTransactionsByJobId(job.getId());
                // Also remove ALL previous work log entries for this job so the activity feed only shows the cancellation
                jobLogRepository.deleteByJobId(job.getId());
                job.setStockRestored(true);
            }
        }
        
        if (status != JobCard.JobStatus.CANCELLED && oldStatus == JobCard.JobStatus.CANCELLED) {
            System.out.println("DEBUG: Reserving stock for Job #" + id + " (Restoration)");
            reduceStockForItems(job, "Job #" + id + " Restored");
        }

        // Trigger 'STOCK_OUT' log specifically when moving from WAITING to PAID
        if (status == JobCard.JobStatus.PAID && oldStatus == JobCard.JobStatus.WAITING) {
            logStockOutActivity(job);
        }

        // AUTO-TIMESTAMP LOGIC
        
        if (status == JobCard.JobStatus.PAID && oldStatus != JobCard.JobStatus.PAID) {
            // Update End Time to 'Now' when work is completed
            job.setEndTime(java.time.LocalDateTime.now());
        }
        
        // Release reservations if the job is now PAID
        if (status == JobCard.JobStatus.PAID && oldStatus != JobCard.JobStatus.PAID && oldStatus != JobCard.JobStatus.CANCELLED) {
            for (JobItem ji : job.getItems()) {
                if (ji.getStockItem() != null && ji.getStockItem().getId() != null && ji.getQuantity() != null && ji.getQuantity() > 0) {
                    stockService.releaseReservation(ji.getStockItem().getId(), ji.getQuantity(), job.getId());
                }
            }
        }
        
        job.setStatus(status);
        JobCard saved = jobCardRepository.save(job);

        // Only log major milestones to keep the feed clean
        if (status == JobCard.JobStatus.PAID) {
            String services = (saved.getServices() != null) ? saved.getServices().stream().map(JobService::getServiceName).collect(java.util.stream.Collectors.joining(", ")) : "None";
            createLog(saved, "JOB_PAID", "Service completed. Total: Rs. " + saved.getTotalAmount() + " | Services: " + services);
        } else if (status == JobCard.JobStatus.CANCELLED) {
            createLog(saved, "JOB_CANCELLED", "Job cancelled by " + getCurrentUserFullName() + ". Inventory restored.");
        } else if (oldStatus != status) {
            createLog(saved, "STATUS_CHANGED", "Vehicle moved from " + oldStatus + " to " + status);
        }
        return saved;
    }

    @Transactional
    public void deleteJob(Long id) {
        JobCard job = getJobById(id);
        // If deleting an active job, restore the reserved stock
        if (job.getStatus() != JobCard.JobStatus.CANCELLED) {
            System.out.println("DEBUG: Restoring reserved stock for Job #" + id + " due to deletion.");
            restoreStockForItems(job, job.getItems(), "Job #" + id + " Deleted");
            // Clean up stock transaction audit rows - inventory restored so consumption records invalid
            stockService.deleteTransactionsByJobId(job.getId());
            // Also remove any STOCK_OUT work log entry so the activity feed stays clean
            jobLogRepository.deleteByJobIdAndAction(job.getId(), "STOCK_OUT");
        }
        createLog(job, "DELETED", "Job Card #" + id + " was deleted.");
        jobCardRepository.deleteById(id);
    }
}
