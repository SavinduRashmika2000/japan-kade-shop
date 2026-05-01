package com.autocare.backend.service;

import com.autocare.backend.model.ServiceOrder;
import com.autocare.backend.repository.ServiceOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ServiceOrderService {
    @Autowired
    private ServiceOrderRepository serviceOrderRepository;

    public List<ServiceOrder> getAllServiceOrders() {
        return serviceOrderRepository.findAll();
    }

    public ServiceOrder getServiceOrderById(Long id) {
        return serviceOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Service order not found"));
    }

    public ServiceOrder saveServiceOrder(ServiceOrder serviceOrder) {
        return serviceOrderRepository.save(serviceOrder);
    }

    public void deleteServiceOrder(Long id) {
        serviceOrderRepository.deleteById(id);
    }
}
