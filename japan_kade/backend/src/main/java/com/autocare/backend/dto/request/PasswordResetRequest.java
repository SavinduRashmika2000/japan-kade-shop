package com.autocare.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetRequest {
    @NotBlank
    private String phone;
    
    @NotBlank
    private String idNo;
    
    private String newPassword;

    public String getPhone() { return phone; }