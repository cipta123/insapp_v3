const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBusinessDetection() {
  try {
    console.log('🔧 Fixing Instagram Business Message Detection...\n');
    
    const businessId = '17841404895525433';
    
    // Get all Instagram messages
    const allMessages = await prisma.instagramMessage.findMany({
      select: {
        id: true,
        messageId: true,
        senderId: true,
        text: true,
        isFromBusiness: true
      }
    });
    
    console.log(`📊 Found ${allMessages.length} Instagram messages`);
    
    // Find messages that need fixing
    const messagesToFix = allMessages.filter(msg => {
      const shouldBeBusiness = msg.senderId === businessId;
      return msg.isFromBusiness !== shouldBeBusiness;
    });
    
    console.log(`🔍 Found ${messagesToFix.length} messages that need fixing:`);
    
    if (messagesToFix.length === 0) {
      console.log('✅ All messages are correctly detected!');
      return;
    }
    
    // Show what will be fixed
    messagesToFix.forEach((msg, index) => {
      const shouldBeBusiness = msg.senderId === businessId;
      console.log(`${index + 1}. Message: "${msg.text?.substring(0, 40)}..."`);
      console.log(`   Sender: ${msg.senderId}`);
      console.log(`   Current: isFromBusiness=${msg.isFromBusiness}`);
      console.log(`   Will fix to: isFromBusiness=${shouldBeBusiness}`);
      console.log('   ---');
    });
    
    // Ask for confirmation (in production, you might want to skip this)
    console.log(`\n🚀 Ready to fix ${messagesToFix.length} messages...`);
    
    // Fix business messages (from business account)
    const businessMessagesToFix = messagesToFix.filter(msg => msg.senderId === businessId);
    if (businessMessagesToFix.length > 0) {
      const result1 = await prisma.instagramMessage.updateMany({
        where: {
          senderId: businessId,
          isFromBusiness: false
        },
        data: {
          isFromBusiness: true
        }
      });
      console.log(`✅ Fixed ${result1.count} business messages (set to isFromBusiness: true)`);
    }
    
    // Fix customer messages (not from business account)
    const customerMessagesToFix = messagesToFix.filter(msg => msg.senderId !== businessId);
    if (customerMessagesToFix.length > 0) {
      const result2 = await prisma.instagramMessage.updateMany({
        where: {
          senderId: { not: businessId },
          isFromBusiness: true
        },
        data: {
          isFromBusiness: false
        }
      });
      console.log(`✅ Fixed ${result2.count} customer messages (set to isFromBusiness: false)`);
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const verifyMessages = await prisma.instagramMessage.findMany({
      select: {
        id: true,
        senderId: true,
        isFromBusiness: true
      }
    });
    
    const stillIncorrect = verifyMessages.filter(msg => {
      const shouldBeBusiness = msg.senderId === businessId;
      return msg.isFromBusiness !== shouldBeBusiness;
    });
    
    if (stillIncorrect.length === 0) {
      console.log('🎉 SUCCESS! All Instagram messages now have correct business detection.');
      console.log('\n📋 Summary:');
      console.log(`- Business Account ID: ${businessId}`);
      console.log(`- Total messages: ${verifyMessages.length}`);
      console.log(`- Business messages: ${verifyMessages.filter(m => m.isFromBusiness).length}`);
      console.log(`- Customer messages: ${verifyMessages.filter(m => !m.isFromBusiness).length}`);
      console.log('\n💡 Now business replies (both API and manual Instagram app) should appear on the right side with blue bubbles!');
    } else {
      console.log(`❌ Still ${stillIncorrect.length} incorrect detections. Manual check needed.`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBusinessDetection();
