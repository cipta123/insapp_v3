const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBusinessDetection() {
  try {
    console.log('🔍 Testing Instagram Business Message Detection...\n');
    
    // Get recent Instagram messages
    const messages = await prisma.instagramMessage.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        messageId: true,
        senderId: true,
        text: true,
        timestamp: true,
        isFromBusiness: true
      }
    });
    
    console.log('📱 Recent Instagram Messages:');
    console.log('=====================================');
    
    const businessId = '17841404895525433';
    
    messages.forEach((msg, index) => {
      const shouldBeBusiness = msg.senderId === businessId;
      const isCorrectlyDetected = msg.isFromBusiness === shouldBeBusiness;
      
      console.log(`${index + 1}. Message ID: ${msg.messageId}`);
      console.log(`   Sender ID: ${msg.senderId}`);
      console.log(`   Text: "${msg.text?.substring(0, 50)}${msg.text?.length > 50 ? '...' : ''}"`);
      console.log(`   Timestamp: ${msg.timestamp}`);
      console.log(`   isFromBusiness (DB): ${msg.isFromBusiness}`);
      console.log(`   Should be business: ${shouldBeBusiness}`);
      console.log(`   Detection Status: ${isCorrectlyDetected ? '✅ CORRECT' : '❌ INCORRECT'}`);
      console.log('   ---');
    });
    
    // Summary
    const businessMessages = messages.filter(m => m.isFromBusiness === true);
    const customerMessages = messages.filter(m => m.isFromBusiness === false);
    const correctDetections = messages.filter(m => m.isFromBusiness === (m.senderId === businessId));
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total messages: ${messages.length}`);
    console.log(`Business messages: ${businessMessages.length}`);
    console.log(`Customer messages: ${customerMessages.length}`);
    console.log(`Correct detections: ${correctDetections.length}/${messages.length}`);
    console.log(`Business Account ID: ${businessId}`);
    
    if (correctDetections.length === messages.length) {
      console.log('\n🎉 ALL DETECTIONS ARE CORRECT! Business messages should appear on the right side.');
    } else {
      console.log('\n⚠️ Some detections are incorrect. Check webhook logic.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBusinessDetection();
