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