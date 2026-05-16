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