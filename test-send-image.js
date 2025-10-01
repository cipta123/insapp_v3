// Test script untuk send image via Watzap.id API
const testSendImage = async () => {
  try {
    console.log('📸 Testing send image via Watzap.id...');
    
    // Test dengan image URL publik
    const testImageData = {
      conversationId: '6287769583645@s.whatsapp.net', // Ganti dengan nomor yang ada
      imageUrl: 'https://picsum.photos/400/300', // Random image untuk test
      caption: 'Test image dari customer service dashboard!',
      separateCaption: false
    };
    
    const response = await fetch('http://localhost:3000/api/whatsapp/send-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testImageData)
    });
    
    console.log('📡 Send image status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Image sent successfully:', result);
    } else {
      const error = await response.json();
      console.error('❌ Failed to send image:', error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Test juga create dummy received image message
const testReceivedImage = async () => {
  try {
    console.log('📥 Creating test received image message...');
    
    const testReceivedImage = {
      messageId: `test_received_image_${Date.now()}`,
      conversationId: '6287769583645@s.whatsapp.net',
      senderId: '6287769583645@s.whatsapp.net',
      recipientId: 'business',
      text: 'Ini gambar yang saya kirim',
      messageType: 'image',
      mediaUrl: 'test_image_filename.jpg', // This would normally come from webhook
      isFromBusiness: false,
      isRead: false
    };
    
    const response = await fetch('http://localhost:3000/api/whatsapp/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testReceivedImage)
    });
    
    console.log('📡 Create received image status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Received image message created:', result);
    } else {
      const error = await response.json();
      console.error('❌ Failed to create received image:', error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

console.log('🧪 Starting WhatsApp image tests...');
console.log('');

// Run tests
testSendImage();
setTimeout(() => {
  testReceivedImage();
}, 2000);

console.log('');
console.log('📋 Instructions:');
console.log('1. Check WhatsApp tab in dashboard');
console.log('2. Look for image messages in chat');
console.log('3. Images should display with thumbnails');
console.log('4. Click image to open full size');
console.log('5. Check console for any errors');
