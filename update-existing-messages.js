const { PrismaClient } = require('@prisma/client');

async function updateExistingMessages() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Updating existing Instagram messages with isFromBusiness field...');
    
    // Get business account ID from environment
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '17841404895525433';
    console.log('📋 Business Account ID:', businessAccountId);
    
    // Use raw SQL to update messages
    console.log('🔧 Using raw SQL to update messages...');
    
    // Update business messages (where senderId matches business account)
    const businessResult = await prisma.$executeRaw`
      UPDATE InstagramMessage 
      SET isFromBusiness = 1 
      WHERE senderId = ${businessAccountId} AND isFromBusiness IS NULL
    `;
    
    console.log('✅ Updated', businessResult, 'business messages');
    
    // Update customer messages (where senderId does NOT match business account)
    const customerResult = await prisma.$executeRaw`
      UPDATE InstagramMessage 
      SET isFromBusiness = 0 
      WHERE senderId != ${businessAccountId} AND isFromBusiness IS NULL
    `;
    
    console.log('✅ Updated', customerResult, 'customer messages');
    
    // Show summary using raw SQL
    const totalMessages = await prisma.$queryRaw`SELECT COUNT(*) as count FROM InstagramMessage`;
    const businessCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM InstagramMessage WHERE isFromBusiness = 1`;
    const customerCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM InstagramMessage WHERE isFromBusiness = 0`;
    
    console.log('\n📊 SUMMARY:');
    console.log('Total messages:', Number(totalMessages[0].count));
    console.log('Business messages:', Number(businessCount[0].count));
    console.log('Customer messages:', Number(customerCount[0].count));
    console.log('✅ Update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateExistingMessages();
