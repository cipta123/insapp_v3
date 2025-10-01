// Test Instagram access token permissions
const testTokenPermissions = async () => {
  try {
    console.log('🔑 Testing Instagram Access Token Permissions...');
    
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ No Instagram access token found');
      return;
    }
    
    console.log('🔍 Access token available:', accessToken.substring(0, 20) + '...');
    
    // Test token info
    const tokenResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );
    
    console.log('📡 Token test status:', tokenResponse.status);
    
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log('✅ Token valid for account:', tokenData);
    } else {
      const error = await tokenResponse.text();
      console.log('❌ Token error:', error);
    }
    
    // Test comment reply endpoint with a test comment ID
    console.log('\n🧪 Testing comment reply endpoint...');
    
    // Use a fake comment ID to test the endpoint format
    const testCommentId = '17995992647685172'; // The "odd" comment ID from logs
    const testReplyResponse = await fetch(
      `https://graph.instagram.com/v18.0/${testCommentId}/replies`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Test reply message',
          access_token: accessToken
        })
      }
    );
    
    console.log('📡 Reply API test status:', testReplyResponse.status);
    
    if (testReplyResponse.ok) {
      const replyResult = await testReplyResponse.json();
      console.log('✅ Reply API success:', replyResult);
    } else {
      const replyError = await testReplyResponse.text();
      console.log('❌ Reply API error:', replyError);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Load environment variables
require('dotenv').config();

// Run test
testTokenPermissions();
