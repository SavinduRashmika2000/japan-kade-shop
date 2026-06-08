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
            @PathVariable Long id, 
            @Valid @RequestBody ReduceStockRequest request) {
        
        StockItemService.ReductionResult result = stockItemService.reduceStock(id, request.getQuantity(), request.getReason(), null);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/preview-fifo-cost")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<StockItemService.ReductionResult> previewFifoCost(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        
        StockItemService.ReductionResult result = stockItemService.previewFifoCost(id, quantity);
        return ResponseEntity.ok(result);
    }

    /**
     * Per-item inventory profit analytics endpoint.
     * Computes landedCostPerUnit, gpPerUnit, soldQty, totalProfit, remainingValue,
     * estimatedFutureProfit from existing batch and item data.
     * No schema changes required — all derived from StockBatch fields.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getInventoryAnalytics() {
        List<StockItem> items = stockItemService.getAllStockItems();
        
        // Performance Optimization: Fetch all batches and job items once to avoid N+1 queries
        java.time.LocalDateTime startOfCurrentMonth = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
        List<StockBatch> allBatches = stockBatchRepository.findAll();
        java.util.Map<Long, List<StockBatch>> batchMap = allBatches.stream()
            .collect(Collectors.groupingBy(b -> b.getStockItem().getId()));
            
        List<com.autocare.backend.model.JobItem> allMonthlySales = jobItemRepository.findByJobCardStatusAndJobCardEndTimeAfter(
            com.autocare.backend.model.JobCard.JobStatus.PAID, startOfCurrentMonth);
        java.util.Map<Long, List<com.autocare.backend.model.JobItem>> salesMap = allMonthlySales.stream()
            .collect(Collectors.groupingBy(ji -> ji.getStockItem().getId()));

        List<Map<String, Object>> result = new ArrayList<>();

        java.util.Map<Long, StockBatch> allBatchesMap = allBatches.stream()
            .collect(Collectors.toMap(StockBatch::getId, b -> b));

        for (StockItem item : items) {
            List<StockBatch> batches = batchMap.getOrDefault(item.getId(), new ArrayList<>());
            if (batches.isEmpty()) continue;

            // Aggregate across all batches
            int totalPurchased = batches.stream().mapToInt(b -> b.getInitialQuantity() != null ? b.getInitialQuantity() : 0).sum();
            int remaining = batches.stream().mapToInt(b -> b.getCurrentQuantity() != null ? b.getCurrentQuantity() : 0).sum();
            int soldQty = totalPurchased - remaining;

            // FIFO Pricing: Use the Landed Cost and Selling Price of the OLDEST active (available) batch
            StockBatch oldestActive = batches.stream()
                .filter(b -> b.getCurrentQuantity() != null && b.getCurrentQuantity() > 0)
                .min(java.util.Comparator.comparing(b -> b.getCreatedAt() != null ? b.getCreatedAt() : java.time.LocalDateTime.MIN))
                .orElse(null);
            
            if (oldestActive == null) {
                // If all batches are consumed, fall back to the oldest batch overall
                oldestActive = batches.stream()
                    .min(java.util.Comparator.comparing(b -> b.getCreatedAt() != null ? b.getCreatedAt() : java.time.LocalDateTime.MIN))
                    .orElse(null);
            }

            BigDecimal landedCostPerUnit = BigDecimal.ZERO;
            BigDecimal sellingPricePerUnit = BigDecimal.ZERO;

            if (oldestActive != null) {
                landedCostPerUnit = oldestActive.getLandedCost() != null ? oldestActive.getLandedCost() : (oldestActive.getUnitPrice() != null ? oldestActive.getUnitPrice() : BigDecimal.ZERO);
                sellingPricePerUnit = oldestActive.getSellingPrice() != null ? oldestActive.getSellingPrice() : (item.getUnitPrice() != null ? item.getUnitPrice() : landedCostPerUnit);
            } else if (item.getUnitPrice() != null) {
                sellingPricePerUnit = item.getUnitPrice();
            }

            BigDecimal gpPerUnit = sellingPricePerUnit.subtract(landedCostPerUnit);
            BigDecimal totalRevenue = sellingPricePerUnit.multiply(new BigDecimal(soldQty));
            BigDecimal totalProfit = gpPerUnit.multiply(new BigDecimal(soldQty));
            BigDecimal remainingValue = landedCostPerUnit.multiply(new BigDecimal(remaining));
            BigDecimal estimatedSellingValue = sellingPricePerUnit.multiply(new BigDecimal(remaining));
            BigDecimal estimatedFutureProfit = gpPerUnit.multiply(new BigDecimal(remaining));

            // Monthly breakdown for this specific item (Optimized lookup)
            int monthlySold = 0;
            BigDecimal monthlyRevenue = BigDecimal.ZERO;
            BigDecimal monthlyProfit = BigDecimal.ZERO;

            List<com.autocare.backend.model.JobItem> monthlyItemSales = salesMap.getOrDefault(item.getId(), new ArrayList<>());
            
            for (com.autocare.backend.model.JobItem ji : monthlyItemSales) {
                int q = ji.getQuantity() != null ? ji.getQuantity() : 0;
                monthlySold += q;
                monthlyRevenue = monthlyRevenue.add(ji.getSubtotal() != null ? ji.getSubtotal() : (ji.getPriceAtTime() != null ? ji.getPriceAtTime().multiply(new BigDecimal(q)) : BigDecimal.ZERO));
                
                if (ji.getStockBatchId() != null) {
                    // Fast lookup in map
                    StockBatch b = allBatchesMap.get(ji.getStockBatchId());
                    if (b != null) {
                        BigDecimal landed = b.getLandedCost() != null ? b.getLandedCost() : (b.getUnitPrice() != null ? b.getUnitPrice() : BigDecimal.ZERO);
                        BigDecimal salePrice = ji.getPriceAtTime() != null ? ji.getPriceAtTime() : (b.getSellingPrice() != null ? b.getSellingPrice() : item.getUnitPrice());
                        if (salePrice == null) salePrice = landed;
                        monthlyProfit = monthlyProfit.add(salePrice.subtract(landed).multiply(new BigDecimal(q)));
                    }
                }
            }

            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("itemId", item.getId());
            row.put("name", item.getName());
            row.put("partNumber", item.getPartNumber());
            row.put("supplierName", item.getSupplier() != null ? item.getSupplier().getCompanyName() : "N/A");
            row.put("categoryName", item.getCategory() != null ? item.getCategory().getName() : "N/A");
            row.put("totalPurchased", totalPurchased);
            row.put("soldQty", soldQty);
            row.put("remainingQty", remaining);
            row.put("landedCostPerUnit", landedCostPerUnit.setScale(2, RoundingMode.HALF_UP));
            row.put("sellingPricePerUnit", sellingPricePerUnit.setScale(2, RoundingMode.HALF_UP));
            row.put("gpPerUnit", gpPerUnit.setScale(2, RoundingMode.HALF_UP));
            row.put("totalRevenue", totalRevenue.setScale(2, RoundingMode.HALF_UP));
            row.put("totalProfit", totalProfit.setScale(2, RoundingMode.HALF_UP));
            row.put("remainingValue", remainingValue.setScale(2, RoundingMode.HALF_UP));
            row.put("estimatedSellingValue", estimatedSellingValue.setScale(2, RoundingMode.HALF_UP));
            row.put("estimatedFutureProfit", estimatedFutureProfit.setScale(2, RoundingMode.HALF_UP));
            row.put("monthlySold", monthlySold);
            row.put("monthlyRevenue", monthlyRevenue.setScale(2, RoundingMode.HALF_UP));
            row.put("monthlyProfit", monthlyProfit.setScale(2, RoundingMode.HALF_UP));
            row.put("lowStock", item.getLowStockThreshold() != null && remaining <= item.getLowStockThreshold() && remaining > 0);
            row.put("outOfStock", remaining == 0);
            result.add(row);
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockItem> updateStockItem(@PathVariable Long id, @RequestBody StockItem stockDetails) {
        StockItem item = stockItemService.getStockItemById(id);
        item.setName(stockDetails.getName());
        item.setPartNumber(stockDetails.getPartNumber());
        item.setHsCode(stockDetails.getHsCode());
        item.setQuantity(stockDetails.getQuantity());
        item.setUnitPrice(stockDetails.getUnitPrice());
        item.setLowStockThreshold(stockDetails.getLowStockThreshold());
        item.setSupplier(stockDetails.getSupplier());
        item.setRemarks(stockDetails.getRemarks());
        item.setLocation(stockDetails.getLocation());
        return ResponseEntity.ok(stockItemService.saveStockItem(item));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStockItem(@PathVariable Long id) {
        stockItemService.deleteStockItem(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllStock() {
        stockItemService.deleteAllStock();
        return ResponseEntity.ok().build();
    }
}
