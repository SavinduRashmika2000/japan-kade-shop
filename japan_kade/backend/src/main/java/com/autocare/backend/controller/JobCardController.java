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
