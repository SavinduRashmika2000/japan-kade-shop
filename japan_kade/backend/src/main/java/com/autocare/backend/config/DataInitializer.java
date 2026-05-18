package com.autocare.backend.config;

import com.autocare.backend.model.RoleType;
import com.autocare.backend.model.User;
import com.autocare.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@autocare.com");
            admin.setPhone("0000000000");
            admin.setName("System Admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(RoleType.ROLE_ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println("Admin user created: admin / admin123");
        } else {
            System.out.println("Admin user already exists.");
        }

        if (!userRepository.existsByUsername("staff")) {
            User staff = new User();
            staff.setUsername("staff");