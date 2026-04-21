package com.autocare.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "job_services")
public class JobService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_card_id", nullable = false)
    @JsonIgnore
    @lombok.EqualsAndHashCode.Exclude
    private JobCard jobCard;

    @ManyToOne
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;
