// Create test WhatsApp messages for debugging
const createTestWhatsAppMessages = async () => {
  try {
    console.log('📱 Creating test WhatsApp messages...');
    
    // Create test message 1 - Unread customer message
    const testMessage1 = {
      messageId: `test_wa_${Date.now()}_1`,
      conversationId: '+628123456789',
      senderId: '+628123456789',
      recipientId: 'business',
      text: 'Hello, saya mau tanya tentang produk Anda',
      messageType: 'text',
      isFromBusiness: false,
      isRead: false // This should create unread count
    };
    
    const response1 = await fetch('http://localhost:3000/api/whatsapp/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage1)
    });
    
    console.log('📡 Test message 1 status:', response1.status);
    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ Test message 1 created:', result1);
    }
    
    // Create test message 2 - Another unread customer message
    const testMessage2 = {
      messageId: `test_wa_${Date.now()}_2`,
      conversationId: '+628987654321',
      senderId: '+628987654321',
      recipientId: 'business',
      text: 'Apakah masih ada stock?',
      messageType: 'text',
      isFromBusiness: false,
      isRead: false // This should create unread count
    };
    
    const response2 = await fetch('http://localhost:3000/api/whatsapp/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage2)
    });
    
    console.log('📡 Test message 2 status:', response2.status);
    if (response2.ok) {
      const result2 = await response2.json();
      console.log('✅ Test message 2 created:', result2);
    }
    
    // Create test message 3 - Business reply (should not count as unread)
    const testMessage3 = {
      messageId: `test_wa_${Date.now()}_3`,
      conversationId: '+628123456789',
      senderId: 'business',
      recipientId: '+628123456789',
      text: 'Terima kasih sudah menghubungi kami',
      messageType: 'text',
      isFromBusiness: true,
      isRead: true
    };
    
    const response3 = await fetch('http://localhost:3000/api/whatsapp/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage3)
    });
    
    console.log('📡 Test message 3 status:', response3.status);
    if (response3.ok) {
      const result3 = await response3.json();
      console.log('✅ Test message 3 created:', result3);
    }
    
    console.log('\n🎯 Test WhatsApp messages created!');
    console.log('Expected results:');
    console.log('- Contact +628123456789 should have 1 unread message');
    console.log('- Contact +628987654321 should have 1 unread message');
    console.log('- Total unread count should be 2');
    console.log('\nNow check WhatsApp tab to see if badges appear!');
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Run the test
createTestWhatsAppMessages();
