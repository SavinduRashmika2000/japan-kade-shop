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