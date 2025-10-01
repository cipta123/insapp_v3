const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('📊 Checking current database status...');
    
    const messageCount = await prisma.instagramMessage.count();
    const userCount = await prisma.instagramUser.count();
    
    console.log(`📋 Database Status:`);
    console.log(`   📱 Messages: ${messageCount}`);
    console.log(`   👥 Users: ${userCount}`);
    
    if (messageCount === 0 && userCount === 0) {
      console.log('✅ Database is completely empty - ready for fresh testing!');
    } else {
      console.log('⚠️ Database still contains data');
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
