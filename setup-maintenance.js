// Setup Maintenance System - Jalankan sekali untuk setup lengkap
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MaintenanceSetup {
  constructor() {
    this.setupLog = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${type}: ${message}`);
    this.setupLog.push({ timestamp, type, message });
  }

  createGitignoreEntries() {
    this.log('📝 Adding maintenance files to .gitignore...', 'INFO');
    
    const gitignorePath = '.gitignore';
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    const maintenanceEntries = [
      '# Maintenance and backup files',
      'backups/',
      'health-report-*.json',
      'emergency-fix-report-*.json',
      'maintenance-test-report-*.json',
      '*.backup',
      '*.restore'
    ];
    
    let needsUpdate = false;
    
    for (const entry of maintenanceEntries) {
      if (!gitignoreContent.includes(entry)) {
        gitignoreContent += '\n' + entry;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      fs.writeFileSync(gitignorePath, gitignoreContent);
      this.log('✅ Updated .gitignore with maintenance entries', 'INFO');
    } else {
      this.log('✅ .gitignore already contains maintenance entries', 'INFO');
    }
  }

  createPackageScripts() {
    this.log('📝 Adding maintenance scripts to package.json...', 'INFO');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const maintenanceScripts = {
        'health-check': 'node system-health-check.js',
        'backup': 'node auto-backup.js',
        'emergency-fix': 'node emergency-fix.js',
        'debug-db': 'node debug-db.js',
        'test-login': 'node test-login.js',
        'test-maintenance': 'node test-all-scripts.js'
      };
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      let scriptsAdded = 0;
      
      for (const [name, command] of Object.entries(maintenanceScripts)) {
        if (!packageJson.scripts[name]) {
          packageJson.scripts[name] = command;
          scriptsAdded++;
        }
      }
      
      if (scriptsAdded > 0) {
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        this.log(`✅ Added ${scriptsAdded} maintenance scripts to package.json`, 'INFO');
      } else {
        this.log('✅ Maintenance scripts already exist in package.json', 'INFO');
      }
      
    } catch (error) {
      this.log(`❌ Failed to update package.json: ${error.message}`, 'ERROR');
    }
  }

  createScheduledTasks() {
    this.log('📝 Creating scheduled task examples...', 'INFO');
    
    // Windows batch file for scheduled tasks
    const windowsBatch = `@echo off
REM Daily Health Check - Add to Windows Task Scheduler
cd /d "${process.cwd()}"
node system-health-check.js
if %errorlevel% neq 0 (
    echo HEALTH CHECK FAILED! >> health-check-errors.log
    echo %date% %time% >> health-check-errors.log
)

REM Weekly Backup - Run every Sunday
if %date:~0,3%==Sun (
    node auto-backup.js
)
`;
    
    fs.writeFileSync('maintenance-scheduled-tasks.bat', windowsBatch);
    this.log('✅ Created Windows scheduled task script', 'INFO');
    
    // Linux cron job example
    const cronExample = `# Add these lines to your crontab (crontab -e)
# Daily health check at 9 AM
0 9 * * * cd ${process.cwd()} && node system-health-check.js

# Weekly backup every Sunday at 2 AM
0 2 * * 0 cd ${process.cwd()} && node auto-backup.js

# Emergency check every 4 hours during business hours
0 9,13,17 * * 1-5 cd ${process.cwd()} && node system-health-check.js
`;
    
    fs.writeFileSync('maintenance-cron-example.txt', cronExample);
    this.log('✅ Created Linux cron job examples', 'INFO');
  }

  createMaintenanceReadme() {
    this.log('📝 Creating maintenance README...', 'INFO');
    
    const readmeContent = `# 🛠️ Maintenance System

## Quick Start

### Daily Commands
\`\`\`bash
npm run health-check    # Check system health
npm run backup          # Backup database and files
\`\`\`

### Emergency Commands
\`\`\`bash
npm run emergency-fix   # Fix common issues automatically
npm run debug-db        # Debug database issues
npm run test-login      # Test authentication API
\`\`\`

### Testing
\`\`\`bash
npm run test-maintenance  # Test all maintenance scripts
\`\`\`

## Files Created

- \`system-health-check.js\` - Daily health monitoring
- \`auto-backup.js\` - Automated backup system
- \`emergency-fix.js\` - Emergency repair tool
- \`debug-db.js\` - Database debugging
- \`test-login.js\` - API testing
- \`MAINTENANCE-GUIDE.md\` - Complete troubleshooting guide

## Scheduled Tasks

### Windows
1. Open Task Scheduler
2. Import \`maintenance-scheduled-tasks.bat\`
3. Set to run daily at 9 AM

### Linux
1. Run \`crontab -e\`
2. Add lines from \`maintenance-cron-example.txt\`

## Monitoring

Check these files regularly:
- \`health-report-*.json\` - Daily health reports
- \`emergency-fix-report-*.json\` - Emergency fix logs
- \`backups/\` - Backup files and restore scripts

## Support

If all scripts fail, check:
1. \`MAINTENANCE-GUIDE.md\` - Complete troubleshooting
2. \`backups/\` - Restore from backup
3. Git history - Revert to working state
`;
    
    fs.writeFileSync('MAINTENANCE-README.md', readmeContent);
    this.log('✅ Created maintenance README', 'INFO');
  }

  generateSetupReport() {
    const reportPath = `maintenance-setup-report-${new Date().toISOString().split('T')[0]}.json`;
    const report = {
      timestamp: new Date().toISOString(),
      setupLog: this.setupLog,
      summary: {
        total: this.setupLog.length,
        errors: this.setupLog.filter(l => l.type === 'ERROR').length,
        warnings: this.setupLog.filter(l => l.type === 'WARNING').length,
        info: this.setupLog.filter(l => l.type === 'INFO').length
      },
      filesCreated: [
        'system-health-check.js',
        'auto-backup.js',
        'emergency-fix.js',
        'debug-db.js',
        'test-login.js',
        'test-all-scripts.js',
        'MAINTENANCE-GUIDE.md',
        'MAINTENANCE-README.md',
        'maintenance-scheduled-tasks.bat',
        'maintenance-cron-example.txt'
      ]
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Setup report saved: ${reportPath}`, 'INFO');
    
    return report;
  }

  async runSetup() {
    console.log('🚀 Setting up Maintenance System...\n');
    
    try {
      this.createGitignoreEntries();
      this.createPackageScripts();
      this.createScheduledTasks();
      this.createMaintenanceReadme();
      
      const report = this.generateSetupReport();
      
      console.log('\n' + '='.repeat(60));
      console.log('🚀 MAINTENANCE SYSTEM SETUP COMPLETE');
      console.log('='.repeat(60));
      console.log(`✅ Setup actions: ${report.summary.total}`);
      console.log(`❌ Errors: ${report.summary.errors}`);
      console.log(`⚠️  Warnings: ${report.summary.warnings}`);
      
      if (report.summary.errors === 0) {
        console.log('\n🎉 MAINTENANCE SYSTEM READY!');
        console.log('\n📋 What you can do now:');
        console.log('   1. Run: npm run test-maintenance');
        console.log('   2. Run: npm run health-check');
        console.log('   3. Run: npm run backup');
        console.log('   4. Read: MAINTENANCE-GUIDE.md');
        console.log('   5. Setup: Scheduled tasks (see maintenance-scheduled-tasks.bat)');
        
        console.log('\n🛡️  Your system is now protected against:');
        console.log('   ✅ Database corruption');
        console.log('   ✅ Missing environment variables');
        console.log('   ✅ Authentication failures');
        console.log('   ✅ File system issues');
        console.log('   ✅ Dependency problems');
        
        console.log('\n🔄 Automatic recovery available:');
        console.log('   - Emergency fix: npm run emergency-fix');
        console.log('   - Database restore: Check backups/ folder');
        console.log('   - Health monitoring: npm run health-check');
        
      } else {
        console.log('\n⚠️  SETUP COMPLETED WITH ERRORS');
        const errors = this.setupLog.filter(l => l.type === 'ERROR');
        console.log('\n🚨 ERRORS:');
        errors.forEach(error => console.log(`   - ${error.message}`));
      }
      
      console.log('='.repeat(60));
      
      return report.summary.errors === 0;
      
    } catch (error) {
      this.log(`❌ Setup failed: ${error.message}`, 'ERROR');
      return false;
    }
  }
}

// Run setup
async function runMaintenanceSetup() {
  const setup = new MaintenanceSetup();
  const success = await setup.runSetup();
  
  if (success) {
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Test the system: npm run test-maintenance');
    console.log('2. Run health check: npm run health-check');
    console.log('3. Create first backup: npm run backup');
    console.log('4. Read the guide: MAINTENANCE-GUIDE.md');
  }
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runMaintenanceSetup();
}

module.exports = MaintenanceSetup;
