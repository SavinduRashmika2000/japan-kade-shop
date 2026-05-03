package com.autocare.backend.controller;

import com.autocare.backend.dto.request.LoginRequest;
import com.autocare.backend.dto.request.SignupRequest;
import com.autocare.backend.dto.response.JwtResponse;
import com.autocare.backend.dto.response.MessageResponse;
import com.autocare.backend.model.RoleType;
import com.autocare.backend.model.User;
import com.autocare.backend.repository.UserRepository;
import com.autocare.backend.security.JwtUtils;
import com.autocare.backend.security.UserDetailsImpl;
import com.autocare.backend.repository.CustomerRepository;
import com.autocare.backend.repository.StaffRepository;
import com.autocare.backend.model.Customer;
import com.autocare.backend.model.Staff;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.autocare.backend.dto.request.PasswordResetRequest;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StaffRepository staffRepository;

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;


    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
        
        // Single session enforcement: Update token in DB
        User user = userRepository.findById(userDetails.getId()).get();
        if (!user.isEnabled()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Account is disabled!"));
        }
        user.setCurrentToken(jwt);
        userRepository.save(user);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 userDetails.getEmail(), 
                                                 user.getName(),
                                                 roles));
    }
