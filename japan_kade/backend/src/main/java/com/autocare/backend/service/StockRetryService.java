package com.autocare.backend.service;

import com.autocare.backend.exception.StockLockException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import jakarta.persistence.LockTimeoutException;
import jakarta.persistence.PessimisticLockException;

@Service
public class StockRetryService {

    private static final Logger log = LoggerFactory.getLogger(StockRetryService.class);

    @Autowired
    private StockItemService stockService;

    @Retryable(
        value = {PessimisticLockException.class, LockTimeoutException.class, CannotAcquireLockException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 150)
    )
    public StockItemService.ReductionResult retryableReduceStock(Long id, Integer reduceQty, String reason, Long jobId) {
        log.info("Attempting stock reduction for itemId={}, jobId={}", id, jobId);
        return stockService.reduceStock(id, reduceQty, reason, jobId);
    }

    @Retryable(