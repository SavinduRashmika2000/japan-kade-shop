package com.autocare.backend.repository;

import com.autocare.backend.model.JobLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface JobLogRepository extends JpaRepository<JobLog, Long> {

    List<JobLog> findAllByOrderByTimestampDesc();

    List<JobLog> findByActionOrderByTimestampDesc(String action);

    List<JobLog> findByVehicleNumberContainingIgnoreCaseOrderByTimestampDesc(String vehicleNumber);

    List<JobLog> findByPerformedByOrderByTimestampDesc(String performedBy);

    long countByAction(String action);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM JobLog jl WHERE jl.jobId = :jobId AND jl.action = :action")
    void deleteByJobIdAndAction(@Param("jobId") Long jobId, @Param("action") String action);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM JobLog jl WHERE jl.jobId = :jobId")
    void deleteByJobId(@Param("jobId") Long jobId);
}
