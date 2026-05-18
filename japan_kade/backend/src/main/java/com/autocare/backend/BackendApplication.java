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

				JobLog log3 = new JobLog();
				log3.setJobId(1001L);
				log3.setVehicleNumber("CBA-4567");
				log3.setCustomerName("Kamal Perera");
				log3.setAction("JOB_UPSERT");
				log3.setDetails("Status: PAID | Total: Rs. 11000.00\nServices: Oil Change (Rs.8500), Full Body Wash (Rs.2500), \nItems: Engine Oil 10W-40 (x1), Oil Filter (x1), ");
				log3.setPerformedBy("ADMIN");
				log3.setTimestamp(LocalDateTime.now().minusHours(1));

				JobLog log4 = new JobLog();
				log4.setJobId(1002L);
				log4.setVehicleNumber("WP-KA-1234");
				log4.setCustomerName("Nimal Silva");
				log4.setAction("JOB_UPSERT");
				log4.setDetails("Status: WAITING | Total: Rs. 4500.00\nServices: Wheel Alignment (Rs.4500), \nItems: ");
				log4.setPerformedBy("ADMIN");
				log4.setTimestamp(LocalDateTime.now().minusMinutes(45));

				JobLog log5 = new JobLog();
				log5.setJobId(1003L);
				log5.setVehicleNumber("SGF-8800");
				log5.setCustomerName("Saman Fernando");
				log5.setAction("JOB_UPSERT");
				log5.setDetails("Status: PROCESSING | Total: Rs. 15500.00\nServices: Full Service (Rs.12000), AC Service (Rs.3500), \nItems: Air Filter (x1), Spark Plugs (x4), ");
				log5.setPerformedBy("ADMIN");
				log5.setTimestamp(LocalDateTime.now().minusMinutes(20));

				jobLogRepository.saveAll(java.util.List.of(log1, log2, log3, log4, log5));
				System.out.println("Sample job logs seeded successfully.");
			} else {
				System.out.println("Job logs already present, skipping seed.");
			}
		};
	}
}
