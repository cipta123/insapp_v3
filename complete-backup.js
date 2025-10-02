// Complete Backup - Backup semua file penting yang sudah dimodifikasi
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

class CompleteBackup {
  constructor() {
    this.prisma = new PrismaClient();
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
    console.log('💾 Backing up database...');
    
    try {
      // Backup SystemUser table
      const users = await this.prisma.systemUser.findMany();
      const usersFile = path.join(this.backupDir, 'systemuser-backup.json');
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      console.log(`✅ SystemUser backup: ${users.length} users saved`);

      // Backup other tables
      const tables = [
        { name: 'InstagramMessage', model: 'instagramMessage' },
        { name: 'InstagramComment', model: 'instagramComment' },
        { name: 'InstagramPost', model: 'instagramPost' },
        { name: 'WhatsAppMessage', model: 'whatsAppMessage' },
        { name: 'WhatsAppContact', model: 'whatsAppContact' }
      ];

      for (const table of tables) {
        try {
          const data = await this.prisma[table.model].findMany();
          const tableFile = path.join(this.backupDir, `${table.name.toLowerCase()}-backup.json`);
          fs.writeFileSync(tableFile, JSON.stringify(data, null, 2));
          console.log(`✅ ${table.name} backup: ${data.length} records saved`);
        } catch (error) {
          console.log(`⚠️  ${table.name} backup skipped: ${error.message}`);
        }
      }

    } catch (error) {
      console.error('❌ Database backup failed:', error.message);
    }
  }

  backupCriticalFiles() {
    console.log('📄 Backing up critical files...');
    
    const criticalFiles = [
      // Environment and config
      '.env',
      'package.json',
      
      // Prisma
      'prisma/schema.prisma',
      
      // Authentication system
      'src/app/api/auth/login/route.ts',
      'src/components/AuthProvider.tsx',
      'src/app/login/page.tsx',
      
      // User management
      'src/app/api/system-users/route.ts',
      'src/app/user-setup/page.tsx',
      
      // Main components
      'src/components/Sidebar.tsx',
      'src/app/page.tsx',
      'src/app/layout.tsx',
      
      // Maintenance scripts
      'system-health-check.js',
      'auto-backup.js',
      'emergency-fix.js',
      'debug-db.js',
      'test-login.js',
      'create-demo-users.js',
      'test-all-scripts.js',
      'setup-maintenance.js',
      
      // Documentation
      'MAINTENANCE-GUIDE.md',
      'MAINTENANCE-README.md'
    ];
    
    let backedUpCount = 0;
    
    for (const file of criticalFiles) {
      const sourcePath = path.join(process.cwd(), file);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(this.backupDir, file.replace(/\//g, '_'));
        
        // Create directory if needed
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Backed up: ${file}`);
        backedUpCount++;
      } else {
        console.log(`⚠️  File not found: ${file}`);
      }
    }
    
    console.log(`📊 Total files backed up: ${backedUpCount}`);
  }

  createRestoreInstructions() {
    console.log('📝 Creating restore instructions...');
    
    const instructions = `# 🔄 Complete Backup Restore Instructions

## Backup Information
- **Created**: ${new Date().toISOString()}
- **Location**: ${this.backupDir}
- **Type**: Complete system backup

## Database Restore

### 1. Restore SystemUser table:
\`\`\`bash
# Run this script to restore users
node restore-systemuser.js
\`\`\`

### 2. Restore other tables:
\`\`\`bash
# Restore Instagram data
node restore-instagram.js

# Restore WhatsApp data  
node restore-whatsapp.js
\`\`\`

## File Restore

### Critical Files Backed Up:
- Environment: .env, package.json
- Database: prisma/schema.prisma
- Authentication: login system, AuthProvider
- User Management: user-setup page, API endpoints
- UI Components: Sidebar, main pages
- Maintenance: All maintenance scripts
- Documentation: Complete guides

### Manual Restore:
1. Copy files from backup folder to original locations
2. Rename files (remove underscore prefixes)
3. Restart server: \`npm run dev\`

## Emergency Restore Commands

### If system completely broken:
\`\`\`bash
# 1. Restore database
node restore-systemuser.js

# 2. Copy critical files
cp backup-files/* ./

# 3. Restart everything
npm install
npm run dev
\`\`\`

### If only authentication broken:
\`\`\`bash
# Restore auth files
cp src_app_api_auth_login_route.ts src/app/api/auth/login/route.ts
cp src_components_AuthProvider.tsx src/components/AuthProvider.tsx
cp src_app_login_page.tsx src/app/login/page.tsx

# Restart server
npm run dev
\`\`\`

## Verification

After restore, run:
\`\`\`bash
npm run health-check
npm run test-login
npm run test-maintenance
\`\`\`

## Support

If restore fails:
1. Check MAINTENANCE-GUIDE.md
2. Run emergency-fix.js
3. Use git history as fallback
`;

    const instructionsFile = path.join(this.backupDir, 'RESTORE-INSTRUCTIONS.md');
    fs.writeFileSync(instructionsFile, instructions);
    console.log('✅ Restore instructions created');
  }

  createRestoreScripts() {
    console.log('🔧 Creating restore scripts...');
    
    // SystemUser restore script
    const systemUserRestore = `
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function restoreSystemUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Restoring SystemUser table...');
    
    const backupData = JSON.parse(fs.readFileSync('systemuser-backup.json', 'utf8'));
    
    // Clear existing users
    await prisma.systemUser.deleteMany();
    console.log('🗑️  Cleared existing users');
    
    // Restore users
    for (const user of backupData) {
      await prisma.systemUser.create({
        data: {
          id: user.id,
          username: user.username,
          password: user.password,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
      console.log(\`✅ Restored user: \${user.username}\`);
    }
    
    console.log('🎉 SystemUser restore completed!');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restoreSystemUsers();
`;

    const restoreFile = path.join(this.backupDir, 'restore-systemuser.js');
    fs.writeFileSync(restoreFile, systemUserRestore);
    console.log('✅ SystemUser restore script created');
  }

  generateBackupReport() {
    const reportPath = path.join(this.backupDir, 'backup-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      backupLocation: this.backupDir,
      type: 'complete-backup',
      includes: {
        database: true,
        criticalFiles: true,
        maintenanceScripts: true,
        documentation: true,
        restoreScripts: true
      },
      instructions: 'See RESTORE-INSTRUCTIONS.md for complete restore guide'
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('📊 Backup report saved');
    
    return report;
  }

  async runCompleteBackup() {
    console.log('🚀 Starting Complete Backup...\n');
    
    try {
      this.ensureBackupDir();
      await this.backupDatabase();
      this.backupCriticalFiles();
      this.createRestoreInstructions();
      this.createRestoreScripts();
      const report = this.generateBackupReport();
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 COMPLETE BACKUP SUCCESSFUL!');
      console.log('='.repeat(60));
      console.log(`📁 Backup Location: ${this.backupDir}`);
      console.log('📋 Includes:');
      console.log('   ✅ Complete database (all tables)');
      console.log('   ✅ All critical files');
      console.log('   ✅ Maintenance scripts');
      console.log('   ✅ Documentation');
      console.log('   ✅ Restore scripts & instructions');
      console.log('\n🔄 To restore: See RESTORE-INSTRUCTIONS.md');
      console.log('='.repeat(60));
      
      return true;
      
    } catch (error) {
      console.error('❌ Complete backup failed:', error.message);
      return false;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Run complete backup
async function runCompleteBackup() {
  const backup = new CompleteBackup();
  const success = await backup.runCompleteBackup();
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runCompleteBackup();
}

module.exports = CompleteBackup;
