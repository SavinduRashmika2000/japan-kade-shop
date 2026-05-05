package com.autocare.backend.controller;

import com.autocare.backend.model.JobLog;
import com.autocare.backend.repository.JobLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/job-logs")
public class JobLogController {

    @Autowired
    private JobLogRepository jobLogRepository;