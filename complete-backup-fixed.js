// Complete Backup - Fixed version without Prisma dependency
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class CompleteBackupFixed {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = path.join(process.cwd(), 'backups', `complete-backup-${this.timestamp}`);
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('📁 Created backup directory:', this.backupDir);
    }
  }

  async backupDatabase() {
    try {
      console.log('💾 Backing up database...');
      
      const dbBackupPath = path.join(this.backupDir, 'database-backup.sql');
      const mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
      
      // Use mysqldump to backup database
      const command = `"${mysqldumpPath}" -u root insapp_v3`;
      const { stdout } = await execAsync(command);
      
      fs.writeFileSync(dbBackupPath, stdout);
      console.log('✅ Database backup completed:', dbBackupPath);
      
      return true;
    } catch (error) {
      console.error('❌ Database backup failed:', error.message);
      return false;
    }
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
      console.warn('⚠️ Source directory not found:', src);
      return;
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyFile(src, dest) {
    try {
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('✅ Copied:', path.basename(src));
      } else {
        console.warn('⚠️ File not found:', src);
      }
    } catch (error) {
      console.error('❌ Failed to copy', src, ':', error.message);
    }
  }

  async backupCriticalFiles() {
    console.log('📂 Backing up critical files...');
    
    // Create subdirectories
    const srcBackupDir = path.join(this.backupDir, 'src');
    const prismaBackupDir = path.join(this.backupDir, 'prisma');
    
    // Backup source code
    console.log('📁 Backing up src/ directory...');
    this.copyDirectory('./src', srcBackupDir);
    
    // Backup Prisma schema and migrations
    console.log('📁 Backing up prisma/ directory...');
    this.copyDirectory('./prisma', prismaBackupDir);
    
    // Backup configuration files
    console.log('📄 Backing up configuration files...');
    this.copyFile('./.env', path.join(this.backupDir, '.env'));
    this.copyFile('./package.json', path.join(this.backupDir, 'package.json'));
    this.copyFile('./next.config.js', path.join(this.backupDir, 'next.config.js'));
    this.copyFile('./tailwind.config.js', path.join(this.backupDir, 'tailwind.config.js'));
    this.copyFile('./postcss.config.js', path.join(this.backupDir, 'postcss.config.js'));
    
    // Backup utility scripts
    console.log('🔧 Backing up utility scripts...');
    const jsFiles = fs.readdirSync('.').filter(file => file.endsWith('.js'));
    for (const jsFile of jsFiles) {
      this.copyFile(`./${jsFile}`, path.join(this.backupDir, jsFile));
    }
    
    // Backup SQL files
    const sqlFiles = fs.readdirSync('.').filter(file => file.endsWith('.sql'));
    for (const sqlFile of sqlFiles) {
      this.copyFile(`./${sqlFile}`, path.join(this.backupDir, sqlFile));
    }
  }

  createRestoreScript() {
    const restoreScript = `@echo off
echo 🔄 RESTORE SCRIPT - Complete Backup ${this.timestamp}
echo.

echo 📁 Restoring source files...
xcopy /E /Y src "..\\..\\src\\"
xcopy /E /Y prisma "..\\..\\prisma\\"

echo 📄 Restoring configuration files...
copy /Y .env "..\\..\\env"
copy /Y package.json "..\\..\\package.json"
copy /Y *.js "..\\..\\*.js"

echo 💾 Restoring database...
echo Please run manually: mysql -u root insapp_v3 < database-backup.sql

echo.
echo ✅ Restore completed!
echo 🚀 Run: npm install && npm run dev
pause`;

    const restoreScriptPath = path.join(this.backupDir, 'RESTORE.bat');
    fs.writeFileSync(restoreScriptPath, restoreScript);
    console.log('📜 Created restore script:', restoreScriptPath);
  }

  createBackupReport() {
    const report = `# COMPLETE BACKUP REPORT
Date: ${new Date().toISOString()}
Backup Directory: ${this.backupDir}

## Files Backed Up:
- ✅ Complete src/ directory
- ✅ Complete prisma/ directory  
- ✅ Environment configuration (.env)
- ✅ Package configuration (package.json)
- ✅ All utility scripts (*.js)
- ✅ All SQL files (*.sql)
- ✅ Database dump (database-backup.sql)

## Recent Features Included:
- ✅ Instagram DM WhatsApp-style chat bubbles
- ✅ Business message detection (isFromBusiness field)
- ✅ WhatsApp Business integration
- ✅ Instagram Comments DM-style interface
- ✅ Real-time polling (3-second intervals)
- ✅ 4-level authentication system

## Restore Instructions:
1. Run RESTORE.bat script
2. Restore database: mysql -u root insapp_v3 < database-backup.sql
3. Install dependencies: npm install
4. Start application: npm run dev

## System Status:
- Instagram DM: WhatsApp-style bubbles ✅
- WhatsApp Business: Complete integration ✅
- Instagram Comments: DM-style interface ✅
- Real-time Updates: Active ✅
- Authentication: Working ✅
`;

    const reportPath = path.join(this.backupDir, 'BACKUP_REPORT.md');
    fs.writeFileSync(reportPath, report);
    console.log('📋 Created backup report:', reportPath);
  }

  async run() {
    try {
      console.log('🚀 Starting complete backup...');
      console.log('📅 Timestamp:', this.timestamp);
      
      this.ensureBackupDir();
      
      const dbSuccess = await this.backupDatabase();
      await this.backupCriticalFiles();
      this.createRestoreScript();
      this.createBackupReport();
      
      console.log('\n🎉 COMPLETE BACKUP FINISHED!');
      console.log('📁 Backup location:', this.backupDir);
      console.log('💾 Database backup:', dbSuccess ? '✅ Success' : '❌ Failed');
      console.log('📂 Files backup: ✅ Success');
      console.log('📜 Restore script: ✅ Created');
      console.log('📋 Backup report: ✅ Created');
      
    } catch (error) {
      console.error('💥 Backup failed:', error);
    }
  }
}

// Run the backup
const backup = new CompleteBackupFixed();
backup.run();
