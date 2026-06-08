package com.autocare.backend.service;

import com.autocare.backend.model.Category;
import com.autocare.backend.repository.CategoryRepository;
import com.autocare.backend.repository.StockItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StockItemRepository stockItemRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
    }

    public Category saveCategory(Category category) {
        if (category == null || category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        String trimmedName = category.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new IllegalArgumentException("Category already exists: " + trimmedName);
        }
        category.setName(trimmedName);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        if (categoryDetails == null || categoryDetails.getName() == null || categoryDetails.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        String trimmedName = categoryDetails.getName().trim();
        // Check if another category has the same name
        categoryRepository.findByNameIgnoreCase(trimmedName).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Another category with this name already exists: " + trimmedName);
            }
        });
        category.setName(trimmedName);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        stockItemRepository.nullifyCategoryRelations(id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
}
