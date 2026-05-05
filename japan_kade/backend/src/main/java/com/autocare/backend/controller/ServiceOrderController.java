package com.autocare.backend.controller;

import com.autocare.backend.model.ServiceOrder;
import com.autocare.backend.service.ServiceOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceOrderController {
    @Autowired
    private ServiceOrderService serviceOrderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public List<ServiceOrder> getAllServiceOrders() {
        return serviceOrderService.getAllServiceOrders();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<ServiceOrder> getServiceOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceOrderService.getServiceOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ServiceOrder createServiceOrder(@RequestBody ServiceOrder serviceOrder) {
        return serviceOrderService.saveServiceOrder(serviceOrder);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ServiceOrder> updateServiceOrder(@PathVariable Long id, @RequestBody ServiceOrder details) {
        ServiceOrder order = serviceOrderService.getServiceOrderById(id);
        order.setStatus(details.getStatus());
        order.setNotes(details.getNotes());
        // staff and vehicle assignments would be handled carefully in a real world scenario
        return ResponseEntity.ok(serviceOrderService.saveServiceOrder(order));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteServiceOrder(@PathVariable Long id) {
        serviceOrderService.deleteServiceOrder(id);
        return ResponseEntity.ok().build();
    }
}
