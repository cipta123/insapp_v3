const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('📊 Checking current database status...');
    
    // Check Instagram data
    const messageCount = await prisma.instagramMessage.count();
    const userCount = await prisma.instagramUser.count();
    const commentCount = await prisma.instagramComment.count();
    const postCount = await prisma.instagramPost.count();
    
    // Check WhatsApp data
    const whatsappMessageCount = await prisma.whatsAppMessage.count();
    const whatsappContactCount = await prisma.whatsAppContact.count();
    
    console.log(`📋 Database Status:`);
    console.log(`   📱 Instagram Messages: ${messageCount}`);
    console.log(`   💬 Instagram Comments: ${commentCount}`);
    console.log(`   📄 Instagram Posts: ${postCount}`);
    console.log(`   👥 Instagram Users: ${userCount}`);
    console.log(`   📲 WhatsApp Messages: ${whatsappMessageCount}`);
    console.log(`   📞 WhatsApp Contacts: ${whatsappContactCount}`);
    
    const totalData = messageCount + userCount + commentCount + postCount + whatsappMessageCount + whatsappContactCount;
    
    if (totalData === 0) {
      console.log('\n❌ SEMUA DATA HILANG! Database kosong total.');
      console.log('💡 Kemungkinan penyebab:');
      console.log('   - Database migration rollback setelah git reset');
      console.log('   - Schema berubah dan data tidak compatible');
      console.log('   - Database connection ke database yang berbeda');
    } else {
      console.log(`\n✅ Database masih ada data (${totalData} total records)`);
      
      // Show sample data
      if (messageCount > 0) {
        const latestMessage = await prisma.instagramMessage.findFirst({
          orderBy: { createdAt: 'desc' }
        });
        console.log(`   📱 Latest message: "${latestMessage.text.substring(0, 50)}..."`);
      }
      
      if (commentCount > 0) {
        const latestComment = await prisma.instagramComment.findFirst({
          orderBy: { createdAt: 'desc' }
        });
        console.log(`   💬 Latest comment: "${latestComment.text.substring(0, 50)}..."`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
    console.log('💡 Mungkin ada masalah dengan database connection atau schema');
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
