package com.autocare.backend.service;

import com.autocare.backend.model.ServiceType;
import com.autocare.backend.repository.ServiceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceTypeService {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    public List<ServiceType> getAllServiceTypes() {
        return serviceTypeRepository.findAll();
    }

    public ServiceType getServiceTypeById(Long id) {
        return serviceTypeRepository.findById(id).orElseThrow(() -> new RuntimeException("Service type not found"));
    }

    public ServiceType saveServiceType(ServiceType serviceType) {