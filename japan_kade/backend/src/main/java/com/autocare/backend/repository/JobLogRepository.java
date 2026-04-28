package com.autocare.backend.repository;

import com.autocare.backend.model.JobLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobLogRepository extends JpaRepository<JobLog, Long> {
    List<JobLog> findAllByOrderByTimestampDesc();

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM JobLog jl WHERE jl.jobId = :jobId AND jl.action = :action")
    void deleteByJobIdAndAction(@org.springframework.data.repository.query.Param("jobId") Long jobId,
                                @org.springframework.data.repository.query.Param("action") String action);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM JobLog jl WHERE jl.jobId = :jobId")
    void deleteByJobId(@org.springframework.data.repository.query.Param("jobId") Long jobId);
}

