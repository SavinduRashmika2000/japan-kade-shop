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