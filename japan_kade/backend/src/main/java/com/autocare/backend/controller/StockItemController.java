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
        boolean available = item.getQuantity() >= quantity;
        return ResponseEntity.ok(Map.of(
            "available", available,
            "availableQty", item.getQuantity(),
            "requestedQty", quantity
        ));
    }

    @GetMapping("/{id}/batches")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<com.autocare.backend.model.StockBatch>> getBatches(@PathVariable Long id) {
        return ResponseEntity.ok(stockItemService.getBatchesForItem(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public StockItem createStockItem(@RequestBody StockItem stockItem) {
        return stockItemService.saveStockItem(stockItem);
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StockTransaction>> getAllTransactions() {
        return ResponseEntity.ok(stockItemService.getAllTransactions());
    }

    @PostMapping("/{id}/add-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockItem> addStock(
            @PathVariable Long id, 
            @Valid @RequestBody AddStockRequest request) {
        
        return ResponseEntity.ok(stockItemService.addStock(
            id, 
            request.getQuantity(), 
            request.getUnitPrice(), 
            request.getSupplierId(),
            request.getHsCode(),
            request.getUnitCostForeign(),
            request.getExchangeRate(),
            request.getCurrencyType(),
            request.getFreightCost(),
            request.getShippingCost(),
            request.getBankCharges(),
            request.getClearanceFees(),
            request.getDutyFees(),
            request.getAdditionalExpenses(),
            request.getLandedCost(),
            request.getSellingPrice()
        ));
    }

    @PostMapping("/{id}/reduce-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockItemService.ReductionResult> reduceStock(