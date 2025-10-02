// Emergency Fix Script - Perbaiki masalah umum secara otomatis
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

class EmergencyFix {
  constructor() {
    this.prisma = new PrismaClient();
    this.fixes = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${type}: ${message}`);
    this.fixes.push({ timestamp, type, message });
  }

  async checkAndFixDatabase() {
    this.log('🔍 Checking database...', 'INFO');
    
    try {
      // Test connection
      await this.prisma.$connect();
      this.log('✅ Database connection: OK', 'INFO');
      
      // Check if SystemUser table exists
      try {
        const userCount = await this.prisma.systemUser.count();
        this.log(`✅ SystemUser table exists with ${userCount} users`, 'INFO');
        
        if (userCount < 4) {
          this.log('⚠️  Missing demo users, recreating...', 'WARNING');
          await this.recreateDemoUsers();
        }
        
      } catch (error) {
        this.log('❌ SystemUser table missing, creating...', 'ERROR');
        await this.createSystemUserTable();
      }
      
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async createSystemUserTable() {
    this.log('🔧 Creating SystemUser table...', 'INFO');
    
    try {
      // Run Prisma migration
      const { execSync } = require('child_process');
      execSync('npx prisma migrate dev --name emergency-fix-system-user', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      this.log('✅ SystemUser table created', 'INFO');
      await this.recreateDemoUsers();
      
    } catch (error) {
      this.log(`❌ Failed to create table: ${error.message}`, 'ERROR');
    }
  }

  async recreateDemoUsers() {
    this.log('👥 Recreating demo users...', 'INFO');
    
    const users = [
      {
        username: 'staff1',
        password: 'staff123',
        name: 'Customer Service Staff',
        email: 'staff@company.com',
        role: 'staff'
      },
      {
        username: 'admin1',
        password: 'admin123',
        name: 'System Administrator',
        email: 'admin@company.com',
        role: 'admin'
      },
      {
        username: 'manager1',
        password: 'manager123',
        name: 'Department Manager',
        email: 'manager@company.com',
        role: 'manager'
      },
      {
        username: 'direktur1',
        password: 'direktur123',
        name: 'Executive Director',
        email: 'direktur@company.com',
        role: 'direktur'
      }
    ];

    for (const userData of users) {
      try {
        // Check if user exists
        const existingUser = await this.prisma.systemUser.findUnique({
          where: { username: userData.username }
        });

        if (!existingUser) {
          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          // Create user
          await this.prisma.systemUser.create({
            data: {
              username: userData.username,
              password: hashedPassword,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              isActive: true
            }
          });

          this.log(`✅ Created user: ${userData.username}`, 'INFO');
        } else {
          this.log(`ℹ️  User ${userData.username} already exists`, 'INFO');
        }
      } catch (error) {
        this.log(`❌ Failed to create user ${userData.username}: ${error.message}`, 'ERROR');
      }
    }
  }

  checkAndFixEnvironment() {
    this.log('🔍 Checking environment variables...', 'INFO');
    
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      this.log('✅ .env file exists', 'INFO');
    } else {
      this.log('❌ .env file missing, creating...', 'ERROR');
    }
    
    // Check required variables
    const requiredVars = {
      'DATABASE_URL': 'mysql://root:@localhost:3306/insapp_v3',
      'JWT_SECRET': 'insapp_v3_jwt_secret_key_2025_utserang',
      'MESSENGER_VERIFY_TOKEN': 'utserang_token_2025',
      'APP_SECRET': '17808d6163fccd7e402c5a5b64c1e2c8'
    };
    
    let needsUpdate = false;
    
    for (const [key, defaultValue] of Object.entries(requiredVars)) {
      if (!envContent.includes(key + '=')) {
        this.log(`⚠️  Missing ${key}, adding...`, 'WARNING');
        envContent += `\n${key}="${defaultValue}"`;
        needsUpdate = true;
      } else {
        this.log(`✅ ${key} exists`, 'INFO');
      }
    }
    
    if (needsUpdate) {
      fs.writeFileSync(envPath, envContent);
      this.log('✅ .env file updated', 'INFO');
    }
  }

  checkAndFixCriticalFiles() {
    this.log('🔍 Checking critical files...', 'INFO');
    
    const criticalFiles = [
      'src/app/api/auth/login/route.ts',
      'src/components/AuthProvider.tsx',
      'src/app/login/page.tsx',
      'prisma/schema.prisma'
    ];
    
    for (const file of criticalFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.log(`✅ ${file} exists`, 'INFO');
      } else {
        this.log(`❌ ${file} missing!`, 'ERROR');
      }
    }
  }

  async testLoginAPI() {
    this.log('🔍 Testing login API...', 'INFO');
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'direktur1',
          password: 'direktur123'
        })
      });
      
      if (response.ok) {
        this.log('✅ Login API working', 'INFO');
      } else {
        this.log(`❌ Login API failed: ${response.status}`, 'ERROR');
      }
      
    } catch (error) {
      this.log(`❌ Login API test failed: ${error.message}`, 'ERROR');
    }
  }

  generateFixReport() {
    const reportPath = `emergency-fix-report-${new Date().toISOString().split('T')[0]}.json`;
    const report = {
      timestamp: new Date().toISOString(),
      fixes: this.fixes,
      summary: {
        total: this.fixes.length,
        errors: this.fixes.filter(f => f.type === 'ERROR').length,
        warnings: this.fixes.filter(f => f.type === 'WARNING').length,
        info: this.fixes.filter(f => f.type === 'INFO').length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Fix report saved: ${reportPath}`, 'INFO');
    
    return report;
  }

  async runEmergencyFix() {
    console.log('🚨 Starting Emergency Fix...\n');
    
    try {
      this.checkAndFixEnvironment();
      this.checkAndFixCriticalFiles();
      await this.checkAndFixDatabase();
      await this.testLoginAPI();
      
      const report = this.generateFixReport();
      
      console.log('\n' + '='.repeat(60));
      console.log('🚨 EMERGENCY FIX COMPLETED');
      console.log('='.repeat(60));
      console.log(`✅ Total actions: ${report.summary.total}`);
      console.log(`❌ Errors: ${report.summary.errors}`);
      console.log(`⚠️  Warnings: ${report.summary.warnings}`);
      
      if (report.summary.errors === 0) {
        console.log('\n🎉 System should be working now!');
        console.log('🔗 Try: http://localhost:3000/login');
        console.log('👤 Use: direktur1 / direktur123');
      } else {
        console.log('\n⚠️  Some issues remain. Check the report for details.');
      }
      
      console.log('='.repeat(60));
      
    } catch (error) {
      this.log(`❌ Emergency fix failed: ${error.message}`, 'ERROR');
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Run emergency fix
async function runEmergencyFix() {
  const fixer = new EmergencyFix();
  await fixer.runEmergencyFix();
}

// Run if called directly
if (require.main === module) {
  runEmergencyFix();
}

module.exports = EmergencyFix;
