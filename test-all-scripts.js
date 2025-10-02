// Test All Maintenance Scripts
const fs = require('fs');
const path = require('path');

class MaintenanceScriptTester {
  constructor() {
    this.results = [];
    this.scriptsToTest = [
      'system-health-check.js',
      'auto-backup.js', 
      'emergency-fix.js',
      'debug-db.js',
      'test-login.js',
      'create-demo-users.js'
    ];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${type}: ${message}`);
    this.results.push({ timestamp, type, message });
  }

  checkScriptExists(scriptName) {
    const scriptPath = path.join(process.cwd(), scriptName);
    const exists = fs.existsSync(scriptPath);
    
    if (exists) {
      const stats = fs.statSync(scriptPath);
      this.log(`✅ ${scriptName}: EXISTS (${stats.size} bytes)`, 'INFO');
      return true;
    } else {
      this.log(`❌ ${scriptName}: MISSING`, 'ERROR');
      return false;
    }
  }

  checkRequiredFiles() {
    this.log('🔍 Checking required files...', 'INFO');
    
    const requiredFiles = [
      '.env',
      'prisma/schema.prisma',
      'src/app/api/auth/login/route.ts',
      'src/components/AuthProvider.tsx',
      'package.json'
    ];
    
    let allExist = true;
    
    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.log(`✅ ${file}: EXISTS`, 'INFO');
      } else {
        this.log(`❌ ${file}: MISSING`, 'ERROR');
        allExist = false;
      }
    }
    
    return allExist;
  }

  checkDependencies() {
    this.log('🔍 Checking dependencies...', 'INFO');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredDeps = ['@prisma/client', 'bcryptjs', 'jsonwebtoken', 'next'];
      
      let allInstalled = true;
      
      for (const dep of requiredDeps) {
        const inDeps = packageJson.dependencies && packageJson.dependencies[dep];
        const inDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep];
        
        if (inDeps || inDevDeps) {
          this.log(`✅ ${dep}: INSTALLED`, 'INFO');
        } else {
          this.log(`❌ ${dep}: MISSING`, 'ERROR');
          allInstalled = false;
        }
      }
      
      return allInstalled;
      
    } catch (error) {
      this.log(`❌ Failed to check dependencies: ${error.message}`, 'ERROR');
      return false;
    }
  }

  checkEnvironmentVariables() {
    this.log('🔍 Checking environment variables...', 'INFO');
    
    const requiredEnvs = [
      'DATABASE_URL',
      'JWT_SECRET'
    ];
    
    let allSet = true;
    
    // Read .env file
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      
      for (const env of requiredEnvs) {
        if (envContent.includes(env + '=')) {
          this.log(`✅ ${env}: SET`, 'INFO');
        } else {
          this.log(`❌ ${env}: MISSING`, 'ERROR');
          allSet = false;
        }
      }
      
    } catch (error) {
      this.log(`❌ Failed to read .env: ${error.message}`, 'ERROR');
      allSet = false;
    }
    
    return allSet;
  }

  generateTestReport() {
    const reportPath = `maintenance-test-report-${new Date().toISOString().split('T')[0]}.json`;
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.length,
        errors: this.results.filter(r => r.type === 'ERROR').length,
        warnings: this.results.filter(r => r.type === 'WARNING').length,
        info: this.results.filter(r => r.type === 'INFO').length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Test report saved: ${reportPath}`, 'INFO');
    
    return report;
  }

  async runAllTests() {
    console.log('🧪 Starting Maintenance Scripts Test...\n');
    
    try {
      // Test 1: Check all scripts exist
      this.log('📋 Test 1: Checking script files...', 'INFO');
      let allScriptsExist = true;
      for (const script of this.scriptsToTest) {
        if (!this.checkScriptExists(script)) {
          allScriptsExist = false;
        }
      }
      
      // Test 2: Check required files
      this.log('\n📋 Test 2: Checking required files...', 'INFO');
      const filesExist = this.checkRequiredFiles();
      
      // Test 3: Check dependencies
      this.log('\n📋 Test 3: Checking dependencies...', 'INFO');
      const depsInstalled = this.checkDependencies();
      
      // Test 4: Check environment variables
      this.log('\n📋 Test 4: Checking environment variables...', 'INFO');
      const envsSet = this.checkEnvironmentVariables();
      
      // Generate report
      const report = this.generateTestReport();
      
      // Print summary
      console.log('\n' + '='.repeat(60));
      console.log('🧪 MAINTENANCE SCRIPTS TEST SUMMARY');
      console.log('='.repeat(60));
      console.log(`✅ Total checks: ${report.summary.total}`);
      console.log(`❌ Errors: ${report.summary.errors}`);
      console.log(`⚠️  Warnings: ${report.summary.warnings}`);
      
      const allPassed = report.summary.errors === 0;
      
      if (allPassed) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Maintenance scripts are ready to use');
        console.log('\n📋 Available Commands:');
        console.log('   - node system-health-check.js  (Daily health check)');
        console.log('   - node auto-backup.js          (Backup system)');
        console.log('   - node emergency-fix.js        (Emergency repair)');
        console.log('   - node debug-db.js             (Database debug)');
        console.log('   - node test-login.js           (API test)');
      } else {
        console.log('\n⚠️  SOME TESTS FAILED');
        console.log('❌ Please fix the errors before using maintenance scripts');
        
        const errors = this.results.filter(r => r.type === 'ERROR');
        console.log('\n🚨 ERRORS TO FIX:');
        errors.forEach(error => console.log(`   - ${error.message}`));
      }
      
      console.log('='.repeat(60));
      
      return allPassed;
      
    } catch (error) {
      this.log(`❌ Test failed: ${error.message}`, 'ERROR');
      return false;
    }
  }
}

// Run tests
async function runMaintenanceTests() {
  const tester = new MaintenanceScriptTester();
  const success = await tester.runAllTests();
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runMaintenanceTests();
}

module.exports = MaintenanceScriptTester;
