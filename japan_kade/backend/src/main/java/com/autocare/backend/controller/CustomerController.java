package com.autocare.backend.controller;

import com.autocare.backend.model.Customer;
import com.autocare.backend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.autocare.backend.repository.UserRepository;
import com.autocare.backend.model.User;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public Customer createCustomer(@RequestBody Customer customer) {
        return customerService.saveCustomer(customer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        Customer customer = customerService.getCustomerById(id);
        
        if (updates.containsKey("firstName")) customer.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName")) customer.setLastName((String) updates.get("lastName"));
        if (updates.containsKey("phone")) customer.setPhone((String) updates.get("phone"));
        if (updates.containsKey("address")) customer.setAddress((String) updates.get("address"));
        
        // Also update User if applicable
        if (customer.getUser() != null) {
            User user = customer.getUser();
            if (updates.containsKey("enabled")) {
                user.setEnabled((Boolean) updates.get("enabled"));
            }
            if (updates.containsKey("password") && updates.get("password") != null) {
                String pwd = (String) updates.get("password");
                if (!pwd.isEmpty()) {
                    user.setPassword(passwordEncoder.encode(pwd));
                }
            }
            // Update User details to match customer
            if (updates.containsKey("firstName")) {
                String name = (String) updates.get("firstName");
                if (updates.containsKey("lastName") && updates.get("lastName") != null) {
                    name += " " + updates.get("lastName");
                }
                user.setName(name);
            }
            if (updates.containsKey("phone")) {
                user.setPhone((String) updates.get("phone"));
            }
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(customerService.saveCustomer(customer));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }
}
