// Test script untuk download media API
const testMediaDownload = async () => {
  try {
    console.log('📥 Testing media download API...');
    
    // Test dengan media name dari test message
    const testMediaName = 'test_image_filename.jpg';
    const downloadUrl = `http://localhost:3000/api/whatsapp/download-media?media=${encodeURIComponent(testMediaName)}`;
    
    console.log('🔗 Testing URL:', downloadUrl);
    
    const response = await fetch(downloadUrl);
    
    console.log('📡 Download media status:', response.status);
    console.log('📡 Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.startsWith('image/')) {
        console.log('✅ Image download successful');
        console.log('📊 Content-Length:', response.headers.get('content-length'));
      } else {
        const text = await response.text();
        console.log('📄 Response text:', text);
      }
    } else {
      const error = await response.json();
      console.error('❌ Download failed:', error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Test juga dengan direct browser access
console.log('🧪 Testing WhatsApp media download...');
console.log('');

testMediaDownload();

console.log('');
console.log('📋 Manual Test Instructions:');
console.log('1. Open browser and go to:');
console.log('   http://localhost:3000/api/whatsapp/download-media?media=test_image_filename.jpg');
console.log('2. Check if image loads or shows error');
console.log('3. Check browser console for any errors');
console.log('4. Try clicking image in WhatsApp chat');
console.log('5. Check if alert shows and new tab opens');
