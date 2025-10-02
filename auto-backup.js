// Auto Backup System - Backup database dan file penting
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoBackup {
  constructor() {
    this.prisma = new PrismaClient();
    this.backupDir = path.join(process.cwd(), 'backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('📁 Created backup directory:', this.backupDir);
    }
  }

  async backupDatabase() {
    console.log('💾 Starting database backup...');
    
    try {
      // Export all users
      const users = await this.prisma.systemUser.findMany();
      const backupFile = path.join(this.backupDir, `users-backup-${this.timestamp}.json`);
      
      fs.writeFileSync(backupFile, JSON.stringify(users, null, 2));
      console.log('✅ Database backup saved:', backupFile);
      
      // Also create SQL dump if mysqldump is available
      try {
        const sqlFile = path.join(this.backupDir, `database-${this.timestamp}.sql`);
        execSync(`mysqldump -u root insapp_v3 > "${sqlFile}"`, { stdio: 'inherit' });
        console.log('✅ SQL dump created:', sqlFile);
      } catch (error) {
        console.log('⚠️  SQL dump failed (mysqldump not available)');
      }
      
    } catch (error) {
      console.error('❌ Database backup failed:', error.message);
    }
  }

  backupCriticalFiles() {
    console.log('📄 Backing up critical files...');
    
    const criticalFiles = [
      '.env',
      'prisma/schema.prisma',
      'src/app/api/auth/login/route.ts',
      'src/components/AuthProvider.tsx',
      'src/app/login/page.tsx',
      'package.json'
    ];
    
    const filesBackupDir = path.join(this.backupDir, `files-${this.timestamp}`);
    fs.mkdirSync(filesBackupDir, { recursive: true });
    
    for (const file of criticalFiles) {
      const sourcePath = path.join(process.cwd(), file);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(filesBackupDir, file.replace(/\//g, '_'));
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Backed up: ${file}`);
      } else {
        console.log(`⚠️  File not found: ${file}`);
      }
    }
  }

  createRestoreScript() {
    console.log('🔧 Creating restore script...');
    
    const restoreScript = `
// Restore Script - Generated ${new Date().toISOString()}
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function restoreUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Restoring users from backup...');
    
    const backupData = JSON.parse(fs.readFileSync('users-backup-${this.timestamp}.json', 'utf8'));
    
    // Clear existing users (be careful!)
    await prisma.systemUser.deleteMany();
    console.log('🗑️  Cleared existing users');
    
    // Restore users
    for (const user of backupData) {
      await prisma.systemUser.create({
        data: {
          username: user.username,
          password: user.password,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
      console.log(\`✅ Restored user: \${user.username}\`);
    }
    
    console.log('🎉 Restore completed successfully!');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restoreUsers();
`;
    
    const restoreFile = path.join(this.backupDir, `restore-${this.timestamp}.js`);
    fs.writeFileSync(restoreFile, restoreScript);
    console.log('✅ Restore script created:', restoreFile);
  }

  cleanOldBackups() {
    console.log('🧹 Cleaning old backups...');
    
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = new Date();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime > maxAge) {
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true });
          } else {
            fs.unlinkSync(filePath);
          }
          deletedCount++;
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
      
      if (deletedCount === 0) {
        console.log('✅ No old backups to clean');
      } else {
        console.log(`✅ Cleaned ${deletedCount} old backup(s)`);
      }
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  async runBackup() {
    console.log('🚀 Starting automated backup...\n');
    
    try {
      this.ensureBackupDir();
      await this.backupDatabase();
      this.backupCriticalFiles();
      this.createRestoreScript();
      this.cleanOldBackups();
      
      console.log('\n✅ Backup completed successfully!');
      console.log(`📁 Backup location: ${this.backupDir}`);
      
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Run backup
async function runAutoBackup() {
  const backup = new AutoBackup();
  await backup.runBackup();
}

// Run if called directly
if (require.main === module) {
  runAutoBackup();
}

module.exports = AutoBackup;
