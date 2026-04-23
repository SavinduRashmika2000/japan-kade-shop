package com.autocare.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "staff")
@Data
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String firstName;
    private String lastName;
    public void setLastName(String lastName) { this.lastName = lastName; }
    private String phone;
    private String idNo;
    private String address;
    private String specialization;

    public Long getId() { return id; }