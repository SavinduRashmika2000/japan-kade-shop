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


    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // For customers, the phone number is the primary identifier (used as username internally)
        String phone = signUpRequest.getPhone();
        if (phone == null || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number is required!"));
        }

        // Check if phone number is already registered (either as username or in phone column)
        if (userRepository.existsByUsername(phone) || userRepository.existsByPhone(phone)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number is already registered!"));
        }

        if (signUpRequest.getEmail() != null && !signUpRequest.getEmail().isEmpty()) {
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
        }

        // Ensure idNo is present and unique before database persistence to prevent dangling users
        if (signUpRequest.getIdNo() == null || signUpRequest.getIdNo().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: ID Number is required!"));
        }
        if (customerRepository.existsByIdNo(signUpRequest.getIdNo())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: ID Number is already registered!"));
        }

        // Internal username for Spring Security is set to the phone number
        String username = phone;

        // Create new user's account
        User user = new User();
        user.setUsername(username);
        
        // Ensure empty strings are stored as NULL to avoid duplicate key errors
        String userEmail = signUpRequest.getEmail();
        user.setEmail((userEmail != null && !userEmail.isEmpty()) ? userEmail : null);
        
        user.setPhone(phone); // phone is already fetched and checked above

        
        String fullName = signUpRequest.getFirstName();
        if (signUpRequest.getLastName() != null && !signUpRequest.getLastName().isEmpty()) {
            fullName += " " + signUpRequest.getLastName();
        }
        user.setName(fullName);
        
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setEnabled(true);

        RoleType role = RoleType.ROLE_CUSTOMER; // Default
        user.setRole(role);
        User savedUser = userRepository.save(user);

        // Create Customer profile
        Customer customer = new Customer();
        customer.setUser(savedUser);
        customer.setFirstName(signUpRequest.getFirstName());
        
        String lastName = signUpRequest.getLastName();
        customer.setLastName((lastName != null && !lastName.isEmpty()) ? lastName : null);
        
        customer.setPhone(user.getPhone());
        customer.setIdNo(signUpRequest.getIdNo());
        
        customerRepository.save(customer);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/reset-password/verify")
    public ResponseEntity<?> verifyResetCredentials(@Valid @RequestBody PasswordResetRequest resetRequest) {
        String phone = resetRequest.getPhone();
        String idNo = resetRequest.getIdNo();
        
        System.out.println("DEBUG: Verifying reset for phone: " + phone + ", idNo: " + idNo);
        
        // Find user by phone first
        java.util.Optional<User> userOpt = userRepository.findByPhone(phone);
        if (userOpt.isEmpty()) {
            System.out.println("DEBUG: User not found for phone: " + phone);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Customer not found with this phone number!"));
        }
        
        User user = userOpt.get();
        // Check if customer profile exists
        java.util.Optional<Customer> customerOpt = customerRepository.findByPhone(phone);
        if (customerOpt.isEmpty()) {
            System.out.println("DEBUG: Customer profile not found for user: " + user.getUsername());
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Customer profile not found!"));
        }
        
        Customer customer = customerOpt.get();
        System.out.println("DEBUG: Found customer: " + customer.getFirstName() + ", dbIdNo: " + customer.getIdNo());
        
        if (customer.getIdNo() == null || !customer.getIdNo().equalsIgnoreCase(idNo)) {
            System.out.println("DEBUG: ID mismatch: provided=" + idNo + ", expected=" + customer.getIdNo());
            return ResponseEntity.badRequest().body(new MessageResponse("Error: ID Number does not match our records!"));
        }
        
        return ResponseEntity.ok(new MessageResponse("Credentials verified. You may now reset your password."));
    }

    @PostMapping("/reset-password/change")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest resetRequest) {
        String phone = resetRequest.getPhone();
        String idNo = resetRequest.getIdNo();
        
        java.util.Optional<Customer> customerOpt = customerRepository.findByPhone(phone);
        
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Process failed. Customer not found."));
        }
        
        Customer customer = customerOpt.get();
        if (customer.getIdNo() == null || !customer.getIdNo().equalsIgnoreCase(idNo)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Verification failed."));
        }
        
        User user = customer.getUser();
        user.setPassword(encoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully!"));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createStaff(@Valid @RequestBody SignupRequest signUpRequest) {
        if (signUpRequest.getUsername() == null || signUpRequest.getUsername().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is required for staff!"));
        }
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (signUpRequest.getEmail() != null && !signUpRequest.getEmail().isEmpty()) {
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
        }

        if (signUpRequest.getPhone() != null && !signUpRequest.getPhone().isEmpty()) {
            if (userRepository.existsByPhone(signUpRequest.getPhone())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number is already in use!"));
            }
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        
        String email = signUpRequest.getEmail();
        user.setEmail((email != null && !email.isEmpty()) ? email : null);
        
        String phone = signUpRequest.getPhone();
        user.setPhone((phone != null && !phone.isEmpty()) ? phone : null);
        
        String fullName = signUpRequest.getFirstName();
        if (signUpRequest.getLastName() != null && !signUpRequest.getLastName().isEmpty()) {
            fullName += " " + signUpRequest.getLastName();
        }
        user.setName(fullName);
        
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        RoleType userRole = RoleType.ROLE_STAFF;
        if ("ADMIN".equalsIgnoreCase(signUpRequest.getRole())) {
            userRole = RoleType.ROLE_ADMIN;
        }
        user.setRole(userRole);
        user.setEnabled(true);
        User savedUser = userRepository.save(user);

        Staff staff = new Staff();
        staff.setUser(savedUser);
        staff.setFirstName(signUpRequest.getFirstName());
        
        String lastName = signUpRequest.getLastName();
        staff.setLastName((lastName != null && !lastName.isEmpty()) ? lastName : null);
        
        staff.setPhone(user.getPhone());
        staff.setIdNo(signUpRequest.getIdNo());
        staff.setAddress(signUpRequest.getAddress());
        staffRepository.save(staff);

        return ResponseEntity.ok(new MessageResponse(userRole == RoleType.ROLE_ADMIN ? "Admin member created successfully!" : "Staff member created successfully!"));
    }

    @PutMapping("/staff/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStaff(@PathVariable Long userId, @RequestBody SignupRequest updateRequest) {
        System.out.println("DEBUG: updateStaff triggered for userId: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // Update User Details
        if (updateRequest.getFirstName() != null) {
            String fullName = updateRequest.getFirstName();
            if (updateRequest.getLastName() != null && !updateRequest.getLastName().isEmpty()) {
                fullName += " " + updateRequest.getLastName();
            }
            user.setName(fullName);
        }
        
        if (updateRequest.getEmail() != null) user.setEmail(updateRequest.getEmail());
        if (updateRequest.getPhone() != null) user.setPhone(updateRequest.getPhone());

        // Update password if provided
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(updateRequest.getPassword()));
        }

        // Update active status
        if (updateRequest.getEnabled() != null) {
            System.out.println("DEBUG: Setting user " + userId + " enabled to: " + updateRequest.getEnabled());
            user.setEnabled(updateRequest.getEnabled());
            if (!updateRequest.getEnabled()) {
                user.setCurrentToken(null); // Force logout if disabled
            }
        }

        userRepository.saveAndFlush(user);

        // Update Staff Details
        Staff staff = staffRepository.findByUser(user).orElse(new Staff());
        staff.setUser(user);
        if (updateRequest.getFirstName() != null) staff.setFirstName(updateRequest.getFirstName());
        if (updateRequest.getLastName() != null) staff.setLastName(updateRequest.getLastName());
        if (updateRequest.getPhone() != null) staff.setPhone(updateRequest.getPhone());
        if (updateRequest.getIdNo() != null) staff.setIdNo(updateRequest.getIdNo());
        if (updateRequest.getAddress() != null) staff.setAddress(updateRequest.getAddress());
        
        staffRepository.saveAndFlush(staff);

        return ResponseEntity.ok(new MessageResponse("Team member updated successfully!"));
    }



    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setEnabled(enabled);
        if (!enabled) {
            user.setCurrentToken(null); // Force logout
        }
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User status updated successfully!"));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllStaff() {
        System.out.println("DEBUG: getAllStaff triggered");
        
        // 1. Fetch all users from the system
        java.util.List<User> allUsers = userRepository.findAll();
        System.out.println("DEBUG: Total users in DB: " + allUsers.size());
        
        // 2. Fetch all specific Staff records
        java.util.List<Staff> staffList = staffRepository.findAll();
        System.out.println("DEBUG: Total staff records in DB: " + staffList.size());
        
        java.util.List<java.util.Map<String, Object>> response = new java.util.ArrayList<>();
        
        // 3. Filter for Management roles (Admin and Staff) only
        for (User user : allUsers) {
            RoleType role = user.getRole();
            
            // Skip Customers - User specifically requested to exclude them from Team Management
            if (role == RoleType.ROLE_CUSTOMER) continue;
            
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            
            // Try to find a linked Staff record for extra details
            java.util.Optional<Staff> staffOpt = staffList.stream()
                    .filter(s -> s.getUser().getId().equals(user.getId()))
                    .findFirst();
            
            if (staffOpt.isPresent()) {
                Staff s = staffOpt.get();
                map.put("id", s.getId());
                map.put("userId", user.getId());
                map.put("firstName", s.getFirstName());
                map.put("lastName", s.getLastName());
                map.put("phone", s.getPhone());
                map.put("idNo", s.getIdNo());
                map.put("address", s.getAddress());
            } else {
                // Fallback to User table data if Staff record is missing (e.g. legacy/direct admin)
                map.put("id", null);
                map.put("userId", user.getId());
                String[] nameParts = user.getName() != null ? user.getName().split(" ", 2) : new String[]{"User", ""};
                map.put("firstName", nameParts[0]);
                map.put("lastName", nameParts.length > 1 ? nameParts[1] : "");
                map.put("phone", user.getPhone());
                map.put("idNo", "N/A");
                map.put("address", "N/A");
            }
            
            map.put("email", user.getEmail());
            map.put("enabled", user.isEnabled());
            map.put("role", role.name());
            response.add(map);
        }
        
        System.out.println("DEBUG: Returning " + response.size() + " team members");
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        // Remove linked Staff record if it exists
        java.util.Optional<Staff> staffOpt = staffRepository.findByUser(user);
        staffOpt.ifPresent(staffRepository::delete);
        
        // Remove linked Customer record if it exists
        java.util.Optional<Customer> customerOpt = customerRepository.findByUser(user);
        customerOpt.ifPresent(customerRepository::delete);
        
        userRepository.delete(user);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully from system."));
    }
}
