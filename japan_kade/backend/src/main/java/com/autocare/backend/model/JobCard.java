package com.autocare.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@lombok.EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "job_cards")
@SQLDelete(sql = "UPDATE job_cards SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
public class JobCard extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String vehicleNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column
    private LocalDateTime endTime;

    @Column(nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JobStatus status = JobStatus.WAITING;

    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<JobService> services = new HashSet<>();

    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)