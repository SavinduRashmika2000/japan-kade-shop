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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import com.autocare.backend.model.Category;
import com.autocare.backend.repository.CategoryRepository;
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
        return stockItemRepository.findAll();
    }

    public StockItem getStockItemById(Long id) {
        return stockItemRepository.findById(id).orElseThrow(() -> new RuntimeException("Stock item not found"));
    }

    @Transactional
    public void syncAllStock() {
        List<StockItem> items = stockItemRepository.findAll();
        for (StockItem item : items) {
            List<StockBatch> activeBatches = batchRepository.findByStockItemAndCurrentQuantityGreaterThanOrderByCreatedAtAsc(item, 0);
            
            int totalActiveQty = activeBatches.stream().mapToInt(StockBatch::getCurrentQuantity).sum();
            item.setQuantity(totalActiveQty);
            
            if (!activeBatches.isEmpty()) {
                StockBatch oldest = activeBatches.get(0);
                item.setUnitPrice(oldest.getSellingPrice() != null ? oldest.getSellingPrice() : (oldest.getUnitPrice() != null ? oldest.getUnitPrice() : BigDecimal.ZERO));
                item.setFifoQuantity(oldest.getCurrentQuantity());
            } else {
                item.setUnitPrice(BigDecimal.ZERO);
                item.setFifoQuantity(0);
            }
            stockItemRepository.save(item);
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