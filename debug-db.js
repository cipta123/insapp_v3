// Debug database and user setup
const { PrismaClient } = require('@prisma/client');

async function debugDatabase() {
  console.log('🔍 Starting database debug...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    console.log('1️⃣ Testing database connection...');
    const userCount = await prisma.systemUser.count();
    console.log('✅ Database connection works!');
    console.log('👥 Total users in database:', userCount);
    
    // List all users
    console.log('\n2️⃣ Listing all users...');
    const users = await prisma.systemUser.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - ${user.name} (${user.role}) - Active: ${user.isActive}`);
    });
    
    // Test specific user
    console.log('\n3️⃣ Testing direktur1 user...');
    const testUser = await prisma.systemUser.findUnique({
      where: { username: 'direktur1' }
    });
    
    if (testUser) {
      console.log('✅ direktur1 user found:');
      console.log('   - ID:', testUser.id);
      console.log('   - Name:', testUser.name);
      console.log('   - Email:', testUser.email);
      console.log('   - Role:', testUser.role);
      console.log('   - Active:', testUser.isActive);
      console.log('   - Password hash length:', testUser.password.length);
      console.log('   - Created:', testUser.createdAt);
    } else {
      console.log('❌ direktur1 user not found!');
    }
    
    // Test password verification
    console.log('\n4️⃣ Testing password verification...');
    if (testUser) {
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare('direktur123', testUser.password);
      console.log('Password "direktur123" is valid:', isValid ? '✅' : '❌');
    }
    
  } catch (error) {
    console.error('❌ Database debug failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Test login API: node test-login.js');
  console.log('2. Open browser: http://localhost:3000/test-auth');
  console.log('3. Check browser console for AuthProvider logs');
}

debugDatabase();
