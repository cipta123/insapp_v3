// Test WhatsApp API endpoints
require('dotenv').config();

const testWhatsAppAPI = async () => {
  try {
    console.log('📱 Testing WhatsApp API endpoints...');
    
    // Test 1: Create a test WhatsApp message
    console.log('\n🧪 Test 1: Creating test WhatsApp message...');
    
    const testMessage = {
      messageId: `test_wa_${Date.now()}`,
      conversationId: '+628123456789',
      senderId: '+628123456789',
      recipientId: 'business',
      text: 'Hello, this is a test WhatsApp message!',
      messageType: 'text',
      isFromBusiness: false
    };
    
    const createResponse = await fetch('http://localhost:3000/api/whatsapp/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });
    
    console.log('📡 Create message status:', createResponse.status);
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Message created:', result.id);
    } else {
      const error = await createResponse.text();
      console.log('❌ Create error:', error);
    }
    
    // Test 2: Fetch WhatsApp messages
    console.log('\n🧪 Test 2: Fetching WhatsApp messages...');
    
    const fetchResponse = await fetch('http://localhost:3000/api/whatsapp/messages');
    console.log('📡 Fetch messages status:', fetchResponse.status);
    
    if (fetchResponse.ok) {
      const messages = await fetchResponse.json();
      console.log('✅ Messages fetched:', messages.length, 'messages');
      
      if (messages.length > 0) {
        console.log('📋 Latest message:', {
          id: messages[0].id,
          text: messages[0].text,
          messageType: messages[0].messageType,
          isFromBusiness: messages[0].isFromBusiness
        });
      }
    } else {
      const error = await fetchResponse.text();
      console.log('❌ Fetch error:', error);
    }
    
    // Test 3: Send a reply
    console.log('\n🧪 Test 3: Sending WhatsApp reply...');
    
    const replyResponse = await fetch('http://localhost:3000/api/whatsapp/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId: '+628123456789',
        replyText: 'Thank you for your message! This is an automated reply.'
      })
    });
    
    console.log('📡 Reply status:', replyResponse.status);
    
    if (replyResponse.ok) {
      const result = await replyResponse.json();
      console.log('✅ Reply sent successfully:', result.replyId);
    } else {
      const error = await replyResponse.text();
      console.log('❌ Reply error:', error);
    }
    
    console.log('\n🎯 WhatsApp API test completed!');
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Run the test
testWhatsAppAPI();
