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
				System.out.println("Seeding sample job logs...");

				JobLog log1 = new JobLog();
				log1.setJobId(1001L);
				log1.setVehicleNumber("CBA-4567");
				log1.setCustomerName("Kamal Perera");
				log1.setAction("JOB_UPSERT");
				log1.setDetails("Status: WAITING | Total: Rs. 0.00\nServices: \nItems: ");
				log1.setPerformedBy("ADMIN");
				log1.setTimestamp(LocalDateTime.now().minusHours(3));

				JobLog log2 = new JobLog();
				log2.setJobId(1001L);
				log2.setVehicleNumber("CBA-4567");
				log2.setCustomerName("Kamal Perera");
				log2.setAction("JOB_UPSERT");
				log2.setDetails("Status: PROCESSING | Total: Rs. 0.00\nServices: Oil Change (Rs.8500), Full Body Wash (Rs.2500), \nItems: Engine Oil 10W-40 (x1), Oil Filter (x1), ");
				log2.setPerformedBy("ADMIN");
				log2.setTimestamp(LocalDateTime.now().minusHours(2));