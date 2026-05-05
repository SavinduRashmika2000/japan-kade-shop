package com.autocare.backend.controller;

import com.autocare.backend.model.JobCard;
import com.autocare.backend.service.JobCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/job-cards")
public class JobCardController {

    @Autowired
    private JobCardService jobCardService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public List<JobCard> getAllJobs() {
        return jobCardService.getAllJobs();
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<JobCard> getMyJobs() {
        return jobCardService.getMyJobs();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<JobCard> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobCardService.getJobById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public JobCard createJob(@Valid @RequestBody JobCard jobCard) {
        return jobCardService.saveJob(jobCard);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<JobCard> updateJob(@PathVariable Long id, @Valid @RequestBody JobCard jobCard) {
        jobCard.setId(id);
        return ResponseEntity.ok(jobCardService.saveJob(jobCard));