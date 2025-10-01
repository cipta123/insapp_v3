// Test comment webhook simulation
const testCommentWebhook = async () => {
  try {
    console.log('🧪 Testing Comment Webhook...');
    
    // Simulate Instagram comment webhook payload
    const commentWebhookPayload = {
      object: "instagram",
      entry: [
        {
          id: "17841404217906448", // Your business account ID
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: "comments",
              value: {
                id: "test_comment_" + Date.now(),
                media: {
                  id: "test_post_" + Date.now(),
                  media_type: "IMAGE"
                },
                text: "Test comment from webhook simulation",
                created_time: Math.floor(Date.now() / 1000),
                from: {
                  id: "801101532461905", // Test user ID
                  username: "test_user"
                }
              }
            }
          ]
        }
      ]
    };
    
    console.log('📡 Sending webhook payload to /api/webhook...');
    
    const response = await fetch('http://localhost:3000/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=test_signature' // Mock signature for testing
      },
      body: JSON.stringify(commentWebhookPayload)
    });
    
    console.log('📡 Webhook response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Webhook processed successfully');
      
      // Check if comment was saved
      const commentsResponse = await fetch('http://localhost:3000/api/comments');
      if (commentsResponse.ok) {
        const comments = await commentsResponse.json();
        console.log(`📋 Comments in database: ${comments.length}`);
        
        if (comments.length > 0) {
          console.log('Latest comment:', {
            text: comments[0].text,
            userId: comments[0].userId,
            postId: comments[0].postId
          });
        }
      }
    } else {
      const error = await response.text();
      console.log('❌ Webhook error:', error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Run test
testCommentWebhook();
