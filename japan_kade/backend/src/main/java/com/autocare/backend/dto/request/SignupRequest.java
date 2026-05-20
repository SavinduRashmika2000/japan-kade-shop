package com.autocare.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.Set;

@Data
public class SignupRequest {
    private String username;


    private String email;

    private String password;

    @NotBlank
    private String firstName;
    private String lastName;

    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Pattern(regexp="^\\d{10}$", message="Phone number must be exactly 10 digits")
    private String phone;
    private String idNo;
    private String address;
    private String role;
    @com.fasterxml.jackson.annotation.JsonProperty("enabled")
    private Boolean enabled;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }