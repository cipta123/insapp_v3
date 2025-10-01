const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllData() {
  try {
    console.log('🗑️ Starting data cleanup...');
    
    // Get current counts
    const messageCount = await prisma.instagramMessage.count();
    const userCount = await prisma.instagramUser.count();
    
    console.log(`📊 Current data:`);
    console.log(`   Messages: ${messageCount}`);
    console.log(`   Users: ${userCount}`);
    
    if (messageCount === 0 && userCount === 0) {
      console.log('✅ Database is already empty!');
      return;
    }
    
    console.log('🧹 Clearing all data...');
    
    // Delete all messages first (due to foreign key constraints)
    const deletedMessages = await prisma.instagramMessage.deleteMany({});
    console.log(`🗑️ Deleted ${deletedMessages.count} messages`);
    
    // Delete all users
    const deletedUsers = await prisma.instagramUser.deleteMany({});
    console.log(`🗑️ Deleted ${deletedUsers.count} users`);
    
    console.log('✅ All data cleared successfully!');
    console.log('🎯 Ready for fresh testing!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
clearAllData();
