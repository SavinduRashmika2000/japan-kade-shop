# Operations & Maintenance Guide

## 1. Backup Strategy
- **Automated Backups**: Perform daily automated database backups using `mysqldump` or cloud-provider native snapshots.
- **Retention Policy**: Retain daily backups for 14 days and monthly backups for 12 months.
- **Off-site Storage**: Encrypt and sync backup files to a secure S3 bucket or off-site location.

## 2. Recovery Procedure
1. **Identify Failure**: Verify database corruption or data loss.