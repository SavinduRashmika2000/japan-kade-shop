package com.autocare.backend.controller;

import com.autocare.backend.dto.AddStockRequest;
import com.autocare.backend.dto.ReduceStockRequest;
import com.autocare.backend.model.StockItem;
import com.autocare.backend.model.StockBatch;
import com.autocare.backend.model.StockTransaction;
import com.autocare.backend.service.StockItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class StockItemController {
    @Autowired
    private StockItemService stockItemService;

    @Autowired
    private com.autocare.backend.repository.JobItemRepository jobItemRepository;

    @Autowired
    private com.autocare.backend.repository.StockBatchRepository stockBatchRepository;

    @GetMapping
    public List<StockItem> getAllStockItems() {
        return stockItemService.getAllStockItems();
    }

    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> syncAllStock() {
        stockItemService.syncAllStock();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<StockItem> getStockItemById(@PathVariable Long id) {
        return ResponseEntity.ok(stockItemService.getStockItemById(id));
    }

    @GetMapping("/{id}/check-availability")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Map<String, Object>> checkAvailability(@PathVariable Long id, @RequestParam Integer quantity) {
        StockItem item = stockItemService.getStockItemById(id);