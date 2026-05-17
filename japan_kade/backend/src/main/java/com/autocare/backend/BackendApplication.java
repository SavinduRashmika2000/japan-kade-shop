package com.autocare.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import com.autocare.backend.model.JobLog;
import com.autocare.backend.repository.JobLogRepository;
import java.time.LocalDateTime;

@SpringBootApplication
@EnableRetry
@EnableJpaAuditing
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
