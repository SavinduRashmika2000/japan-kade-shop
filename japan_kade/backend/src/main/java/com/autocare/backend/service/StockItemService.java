package com.autocare.backend.service;

import com.autocare.backend.model.StockItem;
import com.autocare.backend.model.StockTransaction;
import com.autocare.backend.model.StockBatch;
import com.autocare.backend.model.Supplier;
import com.autocare.backend.repository.StockItemRepository;
import com.autocare.backend.repository.StockTransactionRepository;
import com.autocare.backend.repository.SupplierRepository;
import com.autocare.backend.repository.StockBatchRepository;
import com.autocare.backend.model.StockMovement;
import com.autocare.backend.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import com.autocare.backend.model.Category;
import com.autocare.backend.repository.CategoryRepository;
import com.autocare.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.autocare.backend.exception.InsufficientStockException;

@Service
public class StockItemService {
    private static final Logger log = LoggerFactory.getLogger(StockItemService.class);

    @Autowired
    private StockItemRepository stockItemRepository;

    @Autowired
    private StockTransactionRepository transactionRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private StockBatchRepository batchRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StockMovementRepository movementRepository;

    @Autowired
    private UserRepository userRepository;

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

    @PostConstruct
    @Transactional
    public void seedData() {
        syncAllStock();
        if (stockItemRepository.count() > 0) return;

        Category lubricants = new Category(); lubricants.setName("Lubricants"); lubricants = categoryRepository.save(lubricants);
        Category filters = new Category(); filters.setName("Filters"); filters = categoryRepository.save(filters);
        Category brakes = new Category(); brakes.setName("Brake Systems"); brakes = categoryRepository.save(brakes);

        Supplier global = new Supplier();
        global.setCompanyName("Global Auto Parts"); global.setContactPerson("John Smith");
        global.setEmail("sales@global.com"); global.setPhone("0112223334"); global.setAddress("Colombo"); global.setActive(true);
        global = supplierRepository.save(global);
        
        Supplier elite = new Supplier();
        elite.setCompanyName("Elite Lubes"); elite.setContactPerson("Sarah Wilson");
        elite.setEmail("info@elitelube.lk"); elite.setPhone("0119998887"); elite.setAddress("Sapugaskanda"); elite.setActive(true);
        elite = supplierRepository.save(elite);

        // 3. Create Items & Batches
        // Item 1: Synthetic Oil (Has 2 batches - different prices)
        StockItem oil = new StockItem();
        oil.setName("Synthetic Motor Oil 5W-30");
        oil.setPartNumber("OIL-5W30-1L");
        oil.setLowStockThreshold(15);
        oil.setCategory(lubricants);
        oil.setQuantity(0); // Will be updated by addStock
        oil.setUnitPrice(BigDecimal.ZERO);
        oil = stockItemRepository.save(oil);

        // Batch 1: Old Stock (Price: 1500)
        addStock(oil.getId(), 20, new BigDecimal("1500.00"), elite.getId(), null, null, null, null, null, null, null, null, null, null, null, null);
        // Batch 2: New Stock (Price: 1850)
        addStock(oil.getId(), 30, new BigDecimal("1850.00"), elite.getId(), null, null, null, null, null, null, null, null, null, null, null, null);

        // Item 2: Oil Filter (1 batch)
        StockItem filter = new StockItem();
        filter.setName("Standard Oil Filter");
        filter.setPartNumber("FIL-OIL-STD");
        filter.setLowStockThreshold(10);
        filter.setCategory(filters);
        filter.setQuantity(0);
        filter.setUnitPrice(BigDecimal.ZERO);
        filter = stockItemRepository.save(filter);
        addStock(filter.getId(), 40, new BigDecimal("850.00"), global.getId(), null, null, null, null, null, null, null, null, null, null, null, null);

        // Item 3: Brake Pads (Low Stock)
        StockItem pads = new StockItem();
        pads.setName("Ceramic Brake Pads");
        pads.setPartNumber("BRK-CER-01");
        pads.setLowStockThreshold(10);
        pads.setCategory(brakes);
        pads.setQuantity(0);
        pads.setUnitPrice(BigDecimal.ZERO);
        pads = stockItemRepository.save(pads);
        addStock(pads.getId(), 5, new BigDecimal("4500.00"), global.getId(), null, null, null, null, null, null, null, null, null, null, null, null);
    }

    public List<StockItem> getAllStockItems() {
        return stockItemRepository.findAllWithDetails();
    }

    public StockItem getStockItemById(Long id) {
        return stockItemRepository.findByIdWithDetails(id).orElseThrow(() -> new RuntimeException("Stock item not found"));
    }

    @Transactional
    public void syncAllStock() {
        // Bulk fetch: 1 query for all items, 1 query for all active batches
        List<StockItem> items = stockItemRepository.findAll();
        if (items.isEmpty()) return;

        List<StockBatch> allActiveBatches = batchRepository.findAllActiveBatchesOrdered();

        // Group batches by stockItem ID (already sorted oldest-first)
        java.util.Map<Long, List<StockBatch>> batchesByItem = new java.util.LinkedHashMap<>();
        for (StockBatch b : allActiveBatches) {
            Long itemId = b.getStockItem().getId();
            batchesByItem.computeIfAbsent(itemId, k -> new java.util.ArrayList<>()).add(b);
        }

        // Update each item using a direct JPQL UPDATE (no cascade load triggered)
        for (StockItem item : items) {
            List<StockBatch> activeBatches = batchesByItem.getOrDefault(item.getId(), java.util.Collections.emptyList());
            int totalActiveQty = activeBatches.stream().mapToInt(StockBatch::getCurrentQuantity).sum();

            java.math.BigDecimal unitPrice = java.math.BigDecimal.ZERO;
            int fifoQty = 0;
            if (!activeBatches.isEmpty()) {
                StockBatch oldest = activeBatches.get(0);
                unitPrice = oldest.getSellingPrice() != null ? oldest.getSellingPrice()
                        : (oldest.getUnitPrice() != null ? oldest.getUnitPrice() : java.math.BigDecimal.ZERO);
                fifoQty = oldest.getCurrentQuantity();
            }

            stockItemRepository.updateStockSummary(item.getId(), totalActiveQty, unitPrice, fifoQty);
        }
    }


    @Transactional
    public StockItem saveStockItem(StockItem stockItem) {
        Integer initialQty = stockItem.getQuantity();
        BigDecimal price = stockItem.getUnitPrice();
        
        // Save the item first to get an ID
        StockItem saved = stockItemRepository.save(stockItem);
        
        // If initial quantity is provided, create the first FIFO batch
        if (initialQty != null && initialQty > 0) {
            StockBatch batch = new StockBatch();
            batch.setStockItem(saved);
            batch.setInitialQuantity(initialQty);
            batch.setCurrentQuantity(initialQty);
            batch.setUnitPrice(price != null ? price : BigDecimal.ZERO);
            batch.setSupplier(saved.getSupplier());
            batch.setCreatedAt(java.time.LocalDateTime.now());
            batchRepository.save(batch);
            
            // Log the initial stock transaction
            StockTransaction tx = new StockTransaction();
            tx.setStockItem(saved);
            tx.setQuantity(initialQty);
            tx.setUnitPrice(batch.getUnitPrice());
            tx.setTotalAmount(batch.getUnitPrice().multiply(new BigDecimal(initialQty)));
            tx.setTransactionType("ADD");
            tx.setSupplier(saved.getSupplier());
            tx.setNote("Initial Stock Entry");
            tx.setTimestamp(java.time.LocalDateTime.now());
            tx.setPerformedBy(getCurrentUserFullName());
            transactionRepository.save(tx);
        }
        
        return saved;
    }

    public static class BatchConsumption {
        public Long batchId;
        public BigDecimal unitPrice;
        public Integer qty;
        public BigDecimal subtotal;
        public BatchConsumption(Long batchId, BigDecimal unitPrice, Integer qty) {
            this.batchId = batchId;
            this.unitPrice = unitPrice;
            this.qty = qty;
            this.subtotal = unitPrice.multiply(new BigDecimal(qty));
        }
    }

    public static class ReductionResult {
        public StockItem item;
        public String itemName;
        public Integer requestedQty;
        public List<BatchConsumption> allocations;
        public BigDecimal total;

        public ReductionResult(StockItem item, List<BatchConsumption> allocations) {
            this.item = item;
            this.itemName = item.getName();
            this.allocations = allocations;
            this.requestedQty = allocations.stream().mapToInt(a -> a.qty).sum();
            this.total = allocations.stream()
                .map(a -> a.subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
    }

    @Transactional
    public StockItem addStock(Long id, Integer additionalQty, BigDecimal purchasePrice, Long supplierId,
                             String hsCode, BigDecimal unitCostForeign, BigDecimal exchangeRate,
                             String currencyType,
                             BigDecimal freightCost, BigDecimal shippingCost, BigDecimal bankCharges,
                             BigDecimal clearanceFees, BigDecimal dutyFees, BigDecimal additionalExpenses,
                             BigDecimal landedCost, BigDecimal sellingPrice) {
        StockItem item = getStockItemById(id);
        
        BigDecimal normalizedPrice = purchasePrice.setScale(2, RoundingMode.HALF_UP);
        
        if (hsCode != null) item.setHsCode(hsCode);
        
        StockBatch batch = new StockBatch();
        batch.setStockItem(item);
        batch.setInitialQuantity(additionalQty);
        batch.setCurrentQuantity(additionalQty);
        batch.setUnitPrice(normalizedPrice);
        batch.setUnitCostForeign(unitCostForeign);
        batch.setExchangeRate(exchangeRate);
        batch.setCurrencyType(currencyType);
        batch.setFreightCost(freightCost);
        batch.setShippingCost(shippingCost);
        batch.setBankCharges(bankCharges);
        batch.setClearanceFees(clearanceFees);
        batch.setDutyFees(dutyFees);
        batch.setAdditionalExpenses(additionalExpenses);
        batch.setLandedCost(landedCost);
        batch.setSellingPrice(sellingPrice);

        if (supplierId != null) {
            Supplier supplier = supplierRepository.findById(supplierId).orElse(null);
            batch.setSupplier(supplier);
            item.setSupplier(supplier);
        }
        
        batchRepository.save(batch);

        // Update item summary fields
        item.setQuantity(item.getQuantity() + additionalQty);
        item.setLastRestockedAt(java.time.LocalDateTime.now());
        
        // FIFO Pricing: Set item unitPrice to the selling price/cost of the OLDEST available batch
        List<StockBatch> allBatches = batchRepository.findByStockItemAndCurrentQuantityGreaterThanOrderByCreatedAtAsc(item, 0);
        if (!allBatches.isEmpty()) {
            StockBatch oldest = allBatches.get(0);
            item.setUnitPrice(oldest.getSellingPrice() != null ? oldest.getSellingPrice() : (oldest.getUnitPrice() != null ? oldest.getUnitPrice() : BigDecimal.ZERO));
            item.setFifoQuantity(oldest.getCurrentQuantity());
        } else {
            item.setUnitPrice(sellingPrice != null ? sellingPrice : normalizedPrice);
            item.setFifoQuantity(0);
        }

        // Log Transaction
        StockTransaction tx = new StockTransaction();
        tx.setStockItem(item);
        tx.setTransactionType("ADD");
        tx.setQuantity(additionalQty);
        tx.setUnitPrice(normalizedPrice);
        tx.setTotalAmount(normalizedPrice.multiply(new BigDecimal(additionalQty)));
        tx.setSupplier(batch.getSupplier());
        tx.setJobId(null);
        tx.setPerformedBy(getCurrentUserFullName());
        
        transactionRepository.save(tx);
        stockItemRepository.save(item);
        // Re-fetch with all lazy associations initialized to avoid LazyInitializationException during serialization
        return stockItemRepository.findByIdWithDetails(item.getId())
            .orElse(item);
    }

    @Transactional
    public ReductionResult reduceStock(Long id, Integer reduceQty, String reason, Long jobId) {
        return reduceStockInternal(id, reduceQty, reason, jobId, false);
    }


    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ReductionResult previewFifoCost(Long id, Integer qty) {
        log.info("PREVIEW reduceStock for itemId={}, requestedQty={}", id, qty);
        StockItem item = getStockItemById(id);

        if (qty <= 0) {
            throw new IllegalArgumentException("Invalid quantity: " + qty);
        }
        if (item.getQuantity() < qty) {
            throw new com.autocare.backend.exception.InsufficientStockException(
                "Insufficient stock! Available: " + item.getQuantity() + ", Requested: " + qty);
        }

        // Use the non-locking read query — safe for preview only
        List<StockBatch> batches = batchRepository.findAvailableBatchesReadOnly(item);
        log.info("PREVIEW FIFO: Found {} available batches for item '{}'", batches.size(), item.getName());

        int remainingToReduce = qty;
        List<BatchConsumption> consumptions = new java.util.ArrayList<>();

        for (StockBatch batch : batches) {
            if (remainingToReduce <= 0) break;
            int availableInBatch = batch.getCurrentQuantity();
            if (availableInBatch > 0) {
                int toTake = Math.min(availableInBatch, remainingToReduce);
                BigDecimal batchSellingPrice = batch.getSellingPrice() != null ? batch.getSellingPrice() : (batch.getStockItem().getUnitPrice() != null ? batch.getStockItem().getUnitPrice() : batch.getUnitPrice());
                consumptions.add(new BatchConsumption(batch.getId(), batchSellingPrice, toTake));
                remainingToReduce -= toTake;
            }
        }

        if (remainingToReduce > 0) {
            throw new com.autocare.backend.exception.InsufficientStockException(
                "Critical stock mismatch during preview. Remaining: " + remainingToReduce);
        }

        log.info("PREVIEW SUCCESS: Cost calculation complete for item '{}'", item.getName());
        return new ReductionResult(item, consumptions);
    }

    private ReductionResult reduceStockInternal(Long id, Integer reduceQty, String reason, Long jobId, boolean isSimulation) {
        log.info("{} reduceStock for itemId={}, jobId={}, requestedQty={}", 
            isSimulation ? "PREVIEW" : "STARTING", id, jobId, reduceQty);
        StockItem item = getStockItemById(id);
        
        if (reduceQty <= 0) {
            throw new IllegalArgumentException("Invalid quantity: " + reduceQty);
        }
        if (item.getQuantity() < reduceQty) {
            log.warn("Insufficient stock for itemId={}, available={}, requested={}", id, item.getQuantity(), reduceQty);
            throw new InsufficientStockException("Insufficient stock! Available: " + item.getQuantity() + ", Requested: " + reduceQty);
        }

        // Standard FIFO (Oldest first) with Pessimistic Locking
        List<StockBatch> batches = batchRepository.findAvailableBatchesForUpdate(item);
        log.info("FIFO: Found {} available batches for item '{}'", batches.size(), item.getName());
        
        int remainingToReduce = reduceQty;
        List<BatchConsumption> consumptions = new java.util.ArrayList<>();

        for (StockBatch batch : batches) {
            if (remainingToReduce <= 0) break;
            
            int availableInBatch = batch.getCurrentQuantity();
            if (availableInBatch > 0) {
                int toTake = Math.min(availableInBatch, remainingToReduce);
                log.info("FIFO ALLOCATION: Batch ID={}, Price={}, Available={}, Taking={}", 
                    batch.getId(), batch.getUnitPrice(), availableInBatch, toTake);
                
                int newQtyInBatch = availableInBatch - toTake;
                batch.setCurrentQuantity(newQtyInBatch);
                
                // Track this consumption
                BigDecimal batchSellingPrice = batch.getSellingPrice() != null ? batch.getSellingPrice() : (batch.getStockItem().getUnitPrice() != null ? batch.getStockItem().getUnitPrice() : batch.getUnitPrice());
                consumptions.add(new BatchConsumption(batch.getId(), batchSellingPrice, toTake));
                
                // Rule: Never delete empty batches, they are needed for restoration
                if (!isSimulation) {
                    batchRepository.save(batch);
                }
                
                // Log Audit Transaction for THIS specific batch
                if (!isSimulation) {
                    StockTransaction tx = new StockTransaction();
                    tx.setStockItem(item);
                    tx.setTransactionType("REDUCE");
                    tx.setQuantity(toTake);
                    tx.setUnitPrice(batch.getUnitPrice());
                    tx.setTotalAmount(batch.getUnitPrice().multiply(new BigDecimal(toTake)));
                    tx.setNote(reason);
                    tx.setJobId(jobId);
                    tx.setPerformedBy(getCurrentUserFullName());
                    transactionRepository.save(tx);
                }
                
                // Record precise stock movement audit
                if (!isSimulation) {
                    if (jobId == null || !movementRepository.existsByReferenceIdAndStockBatchIdAndType(jobId, batch.getId(), StockMovement.MovementType.RESERVE)) {
                        StockMovement movement = new StockMovement();
                        movement.setStockItem(item);
                        movement.setStockBatchId(batch.getId());
                        movement.setQuantity(toTake);
                        movement.setType(StockMovement.MovementType.RESERVE);
                        movement.setReferenceId(jobId);
                        movementRepository.save(movement);
                    }
                }

                remainingToReduce -= toTake;
                log.info("FIFO STATUS: Remaining requested quantity: {}", remainingToReduce);
            }
        }

        if (remainingToReduce > 0) {
            log.error("FIFO FAILURE: Could not satisfy request. Remaining qty: {}", remainingToReduce);
            throw new InsufficientStockException("Critical stock mismatch during allocation. Remaining: " + remainingToReduce);
        }

        if (isSimulation) {
            log.info("PREVIEW SUCCESS: Cost calculation complete for item '{}'", item.getName());
            return new ReductionResult(item, consumptions);
        }

        log.info("FIFO SUCCESS: Allocation complete for item '{}'. Total records: {}", item.getName(), consumptions.size());

        // Update overall item quantity and reservations
        item.setQuantity(item.getQuantity() - reduceQty);
        item.setReservedQuantity(item.getReservedQuantity() + reduceQty);
        
        // FIFO Pricing: Update item unitPrice and fifoQuantity to the NEW oldest available batch
        List<StockBatch> remainingBatches = batchRepository.findByStockItemAndCurrentQuantityGreaterThanOrderByCreatedAtAsc(item, 0);
        if (!remainingBatches.isEmpty()) {
            StockBatch oldest = remainingBatches.get(0);
            item.setUnitPrice(oldest.getSellingPrice() != null ? oldest.getSellingPrice() : (oldest.getUnitPrice() != null ? oldest.getUnitPrice() : BigDecimal.ZERO));
            item.setFifoQuantity(oldest.getCurrentQuantity());
        } else if (item.getQuantity() == 0) {
            item.setUnitPrice(BigDecimal.ZERO);
            item.setFifoQuantity(0);
        }

        StockItem savedItem = stockItemRepository.save(item);
        return new ReductionResult(savedItem, consumptions);
    }

    @Transactional
    public void restoreStockToBatch(Long batchId, Long itemId, Integer restoreQty, String reason, Long jobId) {
        log.info("Starting restoreStockToBatch for batchId={}, itemId={}, jobId={}, restoreQty={}", batchId, itemId, jobId, restoreQty);
        if (restoreQty <= 0) {
            throw new IllegalArgumentException("Invalid quantity: " + restoreQty);
        }
        StockItem item = getStockItemById(itemId);
        StockBatch batch = batchRepository.findById(batchId).orElse(null);
        
        if (batch != null) {
            batch.setCurrentQuantity(batch.getCurrentQuantity() + restoreQty);
            batchRepository.save(batch);
            
            BigDecimal normalizedPrice = batch.getUnitPrice();
            StockTransaction tx = new StockTransaction();
            tx.setStockItem(item);
            tx.setTransactionType("RESTORE");
            tx.setQuantity(restoreQty);
            tx.setUnitPrice(normalizedPrice);
            tx.setTotalAmount(normalizedPrice.multiply(new BigDecimal(restoreQty)));
            tx.setNote(reason + " (Batch " + batchId + ")");
            tx.setJobId(jobId);
            tx.setPerformedBy(getCurrentUserFullName());
            transactionRepository.save(tx);
            
            if (jobId == null || !movementRepository.existsByReferenceIdAndStockBatchIdAndType(jobId, batch.getId(), StockMovement.MovementType.RESTORE)) {
                StockMovement movement = new StockMovement();
                movement.setStockItem(item);
                movement.setStockBatchId(batch.getId());
                movement.setQuantity(restoreQty);
                movement.setType(StockMovement.MovementType.RESTORE);
                movement.setReferenceId(jobId);
                movementRepository.save(movement);
            }
        } else {
            restoreStock(itemId, restoreQty, reason + " (Legacy Restore)", jobId);
            return;
        }

        item.setQuantity(item.getQuantity() + restoreQty);
        int currentReserved = item.getReservedQuantity() != null ? item.getReservedQuantity() : 0;
        item.setReservedQuantity(Math.max(0, currentReserved - restoreQty));
        
        List<StockBatch> remainingBatches = batchRepository.findByStockItemAndCurrentQuantityGreaterThanOrderByCreatedAtAsc(item, 0);
        if (!remainingBatches.isEmpty()) {
            StockBatch oldest = remainingBatches.get(0);
            item.setUnitPrice(oldest.getSellingPrice() != null ? oldest.getSellingPrice() : (oldest.getUnitPrice() != null ? oldest.getUnitPrice() : BigDecimal.ZERO));
            item.setFifoQuantity(oldest.getCurrentQuantity());
        }
        stockItemRepository.save(item);
    }

    @Transactional
    public void releaseReservation(Long itemId, Integer releaseQty, Long jobId) {
        log.info("Starting releaseReservation for itemId={}, jobId={}, releaseQty={}", itemId, jobId, releaseQty);
        if (releaseQty <= 0) {
            throw new IllegalArgumentException("Invalid quantity: " + releaseQty);
        }
        StockItem item = getStockItemById(itemId);
        int currentReserved = item.getReservedQuantity() != null ? item.getReservedQuantity() : 0;
        if (currentReserved < releaseQty) {
            log.warn("Invalid reserved quantity state for itemId={}, reserved={}, release={}. Auto-correcting to 0.", itemId, currentReserved, releaseQty);
            item.setReservedQuantity(0);
        } else {
            item.setReservedQuantity(currentReserved - releaseQty);
        }
        stockItemRepository.save(item);
        
        if (jobId == null || !movementRepository.existsByReferenceIdAndStockBatchIdAndType(jobId, null, StockMovement.MovementType.CONSUME)) {
            StockMovement movement = new StockMovement();
            movement.setStockItem(item);
            movement.setStockBatchId(null);
            movement.setQuantity(releaseQty);
            movement.setType(StockMovement.MovementType.CONSUME);
            movement.setReferenceId(jobId);
            movementRepository.save(movement);
        }
    }

    public boolean isStockAvailable(Long itemId, Integer requestedQty) {
        StockItem item = getStockItemById(itemId);
        return item.getQuantity() >= requestedQty;
    }

    @Transactional
    public StockItem restoreStock(Long id, Integer restoreQty, String reason, Long jobId) {
        log.info("Starting legacy restoreStock for itemId={}, jobId={}, restoreQty={}", id, jobId, restoreQty);
        StockItem item = getStockItemById(id);
        if (restoreQty <= 0) {
            throw new IllegalArgumentException("Invalid quantity: " + restoreQty);
        }
        item.setQuantity(item.getQuantity() + restoreQty);
        int currentReserved = item.getReservedQuantity() != null ? item.getReservedQuantity() : 0;
        item.setReservedQuantity(Math.max(0, currentReserved - restoreQty));
        item.setLastRestockedAt(java.time.LocalDateTime.now());
        
        // Use rounded price for matching
        BigDecimal normalizedPrice = item.getUnitPrice().setScale(2, RoundingMode.HALF_UP);
        
        // Consolidate: Find oldest batch with matching price (Normal or Restored doesn't matter now)
        List<StockBatch> existingBatches = batchRepository.findByStockItemOrderByCreatedAtAsc(item);
        StockBatch batch = existingBatches.stream()
            .filter(b -> b.getUnitPrice().setScale(2, RoundingMode.HALF_UP).compareTo(normalizedPrice) == 0)
            .findFirst()
            .orElse(null);

        if (batch != null) {
            batch.setInitialQuantity(batch.getInitialQuantity() + restoreQty);
            batch.setCurrentQuantity(batch.getCurrentQuantity() + restoreQty);
        } else {
            batch = new StockBatch();
            batch.setStockItem(item);
            batch.setInitialQuantity(restoreQty);
            batch.setCurrentQuantity(restoreQty);
            batch.setUnitPrice(normalizedPrice);
        }
        batchRepository.save(batch);

        // FIFO Pricing: Set item unitPrice and fifoQuantity to the price/qty of the OLDEST available batch
        List<StockBatch> allBatchesAfterRestore = batchRepository.findByStockItemAndCurrentQuantityGreaterThanOrderByCreatedAtAsc(item, 0);
        if (!allBatchesAfterRestore.isEmpty()) {
            StockBatch oldest = allBatchesAfterRestore.get(0);
            item.setUnitPrice(oldest.getSellingPrice() != null ? oldest.getSellingPrice() : (oldest.getUnitPrice() != null ? oldest.getUnitPrice() : BigDecimal.ZERO));
            item.setFifoQuantity(oldest.getCurrentQuantity());
        }

        // Log Transaction
        StockTransaction tx = new StockTransaction();
        tx.setStockItem(item);
        tx.setTransactionType("RESTORE");
        tx.setQuantity(restoreQty);
        tx.setUnitPrice(normalizedPrice);
        tx.setTotalAmount(normalizedPrice.multiply(new BigDecimal(restoreQty)));
        tx.setNote(reason);
        tx.setJobId(jobId);
        tx.setPerformedBy(getCurrentUserFullName());
        
        transactionRepository.save(tx);
        return stockItemRepository.save(item);
    }

    public List<StockBatch> getBatchesForItem(Long itemId) {
        StockItem item = getStockItemById(itemId);
        return batchRepository.findByStockItemOrderByCreatedAtAsc(item);
    }

    public void deleteStockItem(Long id) {
        stockItemRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteAllStock() {
        transactionRepository.deleteAll();
        batchRepository.deleteAll();
        stockItemRepository.findAll().forEach(item -> {
            item.setQuantity(0);
            item.setUnitPrice(BigDecimal.ZERO);
            stockItemRepository.save(item);
        });
    }

    @Transactional
    public void deleteTransactionsByJobId(Long jobId) {
        if (jobId == null) return;
        transactionRepository.deleteByJobId(jobId);
    }

    public List<StockTransaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByTimestampDesc();
    }

    public List<StockItem> getLowStockItems() {
        return stockItemRepository.findLowStockItems();
    }

    public List<StockItem> getOutOfStockItems() {
        return stockItemRepository.findOutOfStockItems();
    }
}
