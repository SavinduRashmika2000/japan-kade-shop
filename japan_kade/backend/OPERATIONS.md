# Operations & Maintenance Guide

## 1. Backup Strategy
- **Automated Backups**: Perform daily automated database backups using `mysqldump` or cloud-provider native snapshots.
- **Retention Policy**: Retain daily backups for 14 days and monthly backups for 12 months.
- **Off-site Storage**: Encrypt and sync backup files to a secure S3 bucket or off-site location.

## 2. Recovery Procedure
1. **Identify Failure**: Verify database corruption or data loss.
2. **Stop Application**: Scale down application instances to prevent writes.
3. **Restore DB**: Use the latest valid backup to restore the `autocare_db`.
4. **Point-in-Time Recovery**: Use binary logs (binlogs) if recovery to a specific timestamp is required.
5. **Verify Data**: Run integrity checks on `stock_items`, `job_cards`, and `stock_movements`.
6. **Restart Application**: Scale up and monitor logs.

## 3. Monitoring & Alerting
- **Metrics**: Exposed via `/actuator/prometheus`.
- **Dashboards**: Use Grafana with the standard Spring Boot dashboard template.
- **Critical Alerts**:
    - `RateLimitExceeded`: Monitor for brute force or DDoS attempts.
    - `LockTimeoutException`: Monitor for high database contention.
    - `OutOfStock`: Monitor for inventory shortages.
- **Logs**: Centralize logs using ELK (Elasticsearch, Logstash, Kibana) or Grafana Loki.

## 4. Soft Delete Management
- Deleted records are preserved in the database with `is_deleted = true`.
- To purge old records: Manually run `DELETE FROM job_cards WHERE is_deleted = true AND updated_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)`.

## 5. Security Maintenance
- Regularly rotate `JWT_SECRET`.
- Update dependencies monthly to patch vulnerabilities.
- Ensure `/actuator/**` access is restricted to authorized personnel.
