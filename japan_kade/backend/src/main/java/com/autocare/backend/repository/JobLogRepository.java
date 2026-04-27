package com.autocare.backend.repository;

import com.autocare.backend.model.JobLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobLogRepository extends JpaRepository<JobLog, Long> {
    List<JobLog> findAllByOrderByTimestampDesc();