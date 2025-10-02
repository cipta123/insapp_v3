# 🛠️ Maintenance System

## Quick Start

### Daily Commands
```bash
npm run health-check    # Check system health
npm run backup          # Backup database and files
```

### Emergency Commands
```bash
npm run emergency-fix   # Fix common issues automatically
npm run debug-db        # Debug database issues
npm run test-login      # Test authentication API
```

### Testing
```bash
npm run test-maintenance  # Test all maintenance scripts
```

## Files Created

- `system-health-check.js` - Daily health monitoring
- `auto-backup.js` - Automated backup system
- `emergency-fix.js` - Emergency repair tool
- `debug-db.js` - Database debugging
- `test-login.js` - API testing
- `MAINTENANCE-GUIDE.md` - Complete troubleshooting guide

## Scheduled Tasks

### Windows
1. Open Task Scheduler
2. Import `maintenance-scheduled-tasks.bat`
3. Set to run daily at 9 AM

### Linux
1. Run `crontab -e`
2. Add lines from `maintenance-cron-example.txt`

## Monitoring

Check these files regularly:
- `health-report-*.json` - Daily health reports
- `emergency-fix-report-*.json` - Emergency fix logs
- `backups/` - Backup files and restore scripts

## Support

If all scripts fail, check:
1. `MAINTENANCE-GUIDE.md` - Complete troubleshooting
2. `backups/` - Restore from backup
3. Git history - Revert to working state
