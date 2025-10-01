// Create fresh unread WhatsApp messages for badge testing
const createFreshUnreadMessages = async () => {
  try {
    console.log('📱 Creating fresh unread WhatsApp messages...');
    
    // Create unread message for existing contact
    const testMessage1 = {
      messageId: `fresh_wa_${Date.now()}_1`,
      conversationId: '6287769583645@s.whatsapp.net', // Use existing contact
      senderId: '6287769583645@s.whatsapp.net',
      recipientId: 'business',
      text: 'FRESH MESSAGE - Halo, saya butuh bantuan urgent!',
      messageType: 'text',
      isFromBusiness: false,
      isRead: false // IMPORTANT: This should create unread count
    };
    
    const response1 = await fetch('http://localhost:3000/api/whatsapp/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage1)
    });
    
    console.log('📡 Fresh message 1 status:', response1.status);
    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ Fresh message 1 created:', {
        id: result1.id,
        isRead: result1.isRead,
        isFromBusiness: result1.isFromBusiness,
        text: result1.text
      });
    }
    
    // Create another unread message for different contact
    const testMessage2 = {
      messageId: `fresh_wa_${Date.now()}_2`,
      conversationId: '6282249898884@s.whatsapp.net', // Use different existing contact
      senderId: '6282249898884@s.whatsapp.net',
      recipientId: 'business',
      text: 'FRESH MESSAGE 2 - Kapan bisa kirim barang?',
      messageType: 'text',
      isFromBusiness: false,
      isRead: false // IMPORTANT: This should create unread count
    };
    
    const response2 = await fetch('http://localhost:3000/api/whatsapp/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage2)
    });
    
    console.log('📡 Fresh message 2 status:', response2.status);
    if (response2.ok) {
      const result2 = await response2.json();
      console.log('✅ Fresh message 2 created:', {
        id: result2.id,
        isRead: result2.isRead,
        isFromBusiness: result2.isFromBusiness,
        text: result2.text
      });
    }
    
    console.log('\n🎯 Fresh unread messages created!');
    console.log('Expected results:');
    console.log('- Contact 6287769583645@s.whatsapp.net should have badge with unread count');
    console.log('- Contact 6282249898884@s.whatsapp.net should have badge with unread count');
    console.log('\nNow refresh WhatsApp tab and check console logs!');
    
  } catch (error) {
    console.error('💥 Fresh test error:', error.message);
  }
};

// Run the test
createFreshUnreadMessages();
