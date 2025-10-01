// Test comment reply functionality
const testReply = async () => {
  try {
    console.log('🧪 Testing Comment Reply...');
    
    // Get comments first
    const commentsResponse = await fetch('http://localhost:3000/api/comments');
    if (!commentsResponse.ok) {
      console.error('Failed to get comments');
      return;
    }
    
    const comments = await commentsResponse.json();
    console.log(`📋 Found ${comments.length} comments`);
    
    if (comments.length === 0) {
      console.log('⚠️ No comments found to reply to');
      return;
    }
    
    // Find the "odd" comment
    const oddComment = comments.find(c => c.text === 'odd');
    if (!oddComment) {
      console.log('⚠️ "odd" comment not found');
      console.log('Available comments:', comments.map(c => ({ id: c.commentId, text: c.text })));
      return;
    }
    
    console.log('📝 Found "odd" comment:', {
      commentId: oddComment.commentId,
      text: oddComment.text,
      userId: oddComment.userId,
      isReplied: oddComment.isReplied
    });
    
    // Test reply API
    console.log('💬 Testing reply API...');
    const replyResponse = await fetch('http://localhost:3000/api/comments/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commentId: oddComment.commentId,
        replyText: 'Test reply from API - Thank you for your comment!'
      })
    });
    
    console.log('📡 Reply API status:', replyResponse.status);
    
    if (replyResponse.ok) {
      const result = await replyResponse.json();
      console.log('✅ Reply API success:', result);
    } else {
      const error = await replyResponse.text();
      console.log('❌ Reply API error:', error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Run test
testReply();
