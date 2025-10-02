// System Health Check - Jalankan setiap hari untuk memastikan sistem sehat
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

class SystemHealthChecker {
  constructor() {
    this.prisma = new PrismaClient();
    this.healthReport = {
      timestamp: new Date().toISOString(),
      status: 'UNKNOWN',
      checks: [],
      errors: [],
      warnings: []
    };
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${type}: ${message}`);
    
    if (type === 'ERROR') {
      this.healthReport.errors.push(message);
    } else if (type === 'WARNING') {
      this.healthReport.warnings.push(message);
    }
    
    this.healthReport.checks.push({ timestamp, type, message });
  }

  async checkDatabase() {
    this.log('🔍 Checking database connection...', 'INFO');
    
    try {
      // Test connection
      await this.prisma.$connect();
      this.log('✅ Database connection: OK', 'INFO');
      
      // Check SystemUser table
      const userCount = await this.prisma.systemUser.count();
      this.log(`✅ SystemUser table: ${userCount} users found`, 'INFO');
      
      if (userCount < 4) {
        this.log('⚠️ WARNING: Less than 4 users in database', 'WARNING');
      }
      
      // Check demo users
      const demoUsers = ['staff1', 'admin1', 'manager1', 'direktur1'];
      for (const username of demoUsers) {
        const user = await this.prisma.systemUser.findUnique({
          where: { username }
        });
        
        if (user) {
          this.log(`✅ Demo user ${username}: EXISTS`, 'INFO');
        } else {
          this.log(`❌ Demo user ${username}: MISSING`, 'ERROR');
        }
      }
      
    } catch (error) {
      this.log(`❌ Database error: ${error.message}`, 'ERROR');
    }
  }

  checkEnvironmentVariables() {
    this.log('🔍 Checking environment variables...', 'INFO');
    
    const requiredEnvs = [
      'DATABASE_URL',
      'JWT_SECRET',
      'INSTAGRAM_ACCESS_TOKEN',
      'INSTAGRAM_BUSINESS_ACCOUNT_ID'
    ];
    
    for (const env of requiredEnvs) {
      if (process.env[env]) {
        this.log(`✅ ${env}: SET`, 'INFO');
      } else {
        this.log(`❌ ${env}: MISSING`, 'ERROR');
      }
    }
  }

  checkCriticalFiles() {
    this.log('🔍 Checking critical files...', 'INFO');
    
    const criticalFiles = [
      'src/app/api/auth/login/route.ts',
      'src/components/AuthProvider.tsx',
      'src/app/login/page.tsx',
      'src/app/page.tsx',
      'prisma/schema.prisma',
      '.env'
    ];
    
    for (const file of criticalFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        this.log(`✅ ${file}: EXISTS (${stats.size} bytes, modified: ${stats.mtime.toLocaleString()})`, 'INFO');
      } else {
        this.log(`❌ ${file}: MISSING`, 'ERROR');
      }
    }
  }

  async checkAPIEndpoints() {
    this.log('🔍 Checking API endpoints...', 'INFO');
    
    try {
      // Test login API
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'direktur1',
          password: 'direktur123'
        })
      });
      
      if (response.ok) {
        this.log('✅ Login API: WORKING', 'INFO');
      } else {
        this.log(`❌ Login API: FAILED (${response.status})`, 'ERROR');
      }
      
    } catch (error) {
      this.log(`❌ API test failed: ${error.message}`, 'ERROR');
    }
  }

  generateReport() {
    const hasErrors = this.healthReport.errors.length > 0;
    const hasWarnings = this.healthReport.warnings.length > 0;
    
    if (hasErrors) {
      this.healthReport.status = 'CRITICAL';
    } else if (hasWarnings) {
      this.healthReport.status = 'WARNING';
    } else {
      this.healthReport.status = 'HEALTHY';
    }
    
    // Save report to file
    const reportPath = `health-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.healthReport, null, 2));
    
    this.log(`📊 Health report saved to: ${reportPath}`, 'INFO');
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log(`🏥 SYSTEM HEALTH REPORT - ${this.healthReport.status}`);
    console.log('='.repeat(60));
    console.log(`✅ Successful checks: ${this.healthReport.checks.filter(c => c.type === 'INFO').length}`);
    console.log(`⚠️  Warnings: ${this.healthReport.warnings.length}`);
    console.log(`❌ Errors: ${this.healthReport.errors.length}`);
    
    if (hasErrors) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.healthReport.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (hasWarnings) {
      console.log('\n⚠️  WARNINGS:');
      this.healthReport.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('='.repeat(60));
    
    return this.healthReport.status;
  }

  async runFullCheck() {
    console.log('🏥 Starting System Health Check...\n');
    
    try {
      await this.checkDatabase();
      this.checkEnvironmentVariables();
      this.checkCriticalFiles();
      await this.checkAPIEndpoints();
      
      return this.generateReport();
      
    } catch (error) {
      this.log(`❌ Health check failed: ${error.message}`, 'ERROR');
      return 'FAILED';
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Run health check
async function runHealthCheck() {
  const checker = new SystemHealthChecker();
  const status = await checker.runFullCheck();
  
  // Exit with appropriate code
  if (status === 'HEALTHY') {
    process.exit(0);
  } else if (status === 'WARNING') {
    process.exit(1);
  } else {
    process.exit(2);
  }
}

// Run if called directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = SystemHealthChecker;
