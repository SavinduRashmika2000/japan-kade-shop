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
public class ServiceTypeController {

    @Autowired
    private ServiceTypeService serviceTypeService;

    @GetMapping
    public List<ServiceType> getAllServiceTypes() {
        return serviceTypeService.getAllServiceTypes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceType> getServiceTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceTypeService.getServiceTypeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ServiceType createServiceType(@RequestBody ServiceType serviceType) {
        return serviceTypeService.saveServiceType(serviceType);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceType> updateServiceType(@PathVariable Long id, @RequestBody ServiceType details) {
        ServiceType serviceType = serviceTypeService.getServiceTypeById(id);
        serviceType.setName(details.getName());
        serviceType.setDescription(details.getDescription());
        serviceType.setBasePrice(details.getBasePrice());