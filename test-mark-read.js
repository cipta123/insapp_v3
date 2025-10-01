// Test mark as read functionality
const testMarkRead = async () => {
  try {
    console.log('🧪 Testing mark as read API...');
    
    // First, let's check if we have any messages
    const messagesResponse = await fetch('http://localhost:3000/api/messages');
    if (messagesResponse.ok) {
      const messages = await messagesResponse.json();
      console.log(`📱 Found ${messages.length} messages`);
      
      if (messages.length > 0) {
        const testMessage = messages[0];
        console.log('📋 Test message:', {
          id: testMessage.id,
          conversationId: testMessage.conversationId,
          senderId: testMessage.senderId,
          isRead: testMessage.isRead,
          text: testMessage.text.substring(0, 50) + '...'
        });
        
        // Test mark as read
        console.log('📖 Testing mark as read for conversation:', testMessage.conversationId);
        
        const markReadResponse = await fetch('http://localhost:3000/api/messages/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            conversationId: testMessage.conversationId 
          })
        });
        
        console.log('📖 Mark read response status:', markReadResponse.status);
        
        if (markReadResponse.ok) {
          const result = await markReadResponse.json();
          console.log('✅ Mark read result:', result);
          
          // Check if messages are actually marked as read
          const updatedMessagesResponse = await fetch('http://localhost:3000/api/messages');
          if (updatedMessagesResponse.ok) {
            const updatedMessages = await updatedMessagesResponse.json();
            const updatedMessage = updatedMessages.find(m => m.id === testMessage.id);
            console.log('📋 Updated message status:', {
              id: updatedMessage.id,
              isRead: updatedMessage.isRead,
              wasRead: testMessage.isRead,
              changed: testMessage.isRead !== updatedMessage.isRead
            });
          }
        } else {
          const error = await markReadResponse.text();
          console.log('❌ Mark read error:', error);
        }
      } else {
        console.log('⚠️ No messages found. Send a message first!');
      }
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Run test
testMarkRead();
