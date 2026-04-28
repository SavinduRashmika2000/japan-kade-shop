package com.autocare.backend.repository;

import com.autocare.backend.model.StockBatch;
import com.autocare.backend.model.StockItem;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;