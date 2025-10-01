// Test script untuk Instagram User Info API
const testUserInfo = async () => {
  const userId = '801101532461905'; // Test user ID
  const accessToken = 'IGAAMBijRRzZCdBZAFJmQmFEWkNNbkhGemJhZAjMzZAnVlU0lHT0ZAjZAVlvZAUU0VzBaMmVWOWdwZAlZAVRFRTN1ZAaNGx6VXVTZAlhSeEEtX2pEV2FtN0E1enp1MmlONUUxdmRob0hMTnZARV0dzUjZAiYjgzVGkxcnBR';
  
  try {
    console.log('🔍 Testing Instagram Graph API for user:', userId);
    
    const url = `https://graph.instagram.com/v18.0/${userId}?fields=name,username&access_token=${accessToken}`;
    console.log('📡 API URL:', url);
    
    const response = await fetch(url);
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! User data:', data);
    } else {
      const error = await response.text();
      console.log('❌ Error response:', error);
    }
    
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
};

// Run test
testUserInfo();
