package com.autocare.backend.controller;

import com.autocare.backend.model.ServiceType;
import com.autocare.backend.service.ServiceTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-types")
@CrossOrigin(origins = "*", allowedHeaders = "*")