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

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner schemaUpdater(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE users MODIFY email VARCHAR(255) NULL;");
				jdbcTemplate.execute("ALTER TABLE users MODIFY username VARCHAR(255) NULL;");
				jdbcTemplate.execute("ALTER TABLE customers MODIFY last_name VARCHAR(255) NULL;");
				jdbcTemplate.execute("ALTER TABLE staff MODIFY last_name VARCHAR(255) NULL;");
				System.out.println("Successfully updated schema: made optional columns nullable.");
			} catch (Exception e) {
				System.out.println("Schema update skipped or failed: " + e.getMessage());
			}
		};
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner seedJobLogs(JobLogRepository jobLogRepository) {
		return args -> {
			if (jobLogRepository.count() == 0) {