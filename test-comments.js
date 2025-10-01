// Test Instagram Comments functionality
const testComments = async () => {
  try {
    console.log('🧪 Testing Instagram Comments System...');
    
    // Test 1: Check if comments page loads
    console.log('\n📋 Test 1: Comments Page');
    const commentsResponse = await fetch('http://localhost:3000/comments');
    console.log('Comments page status:', commentsResponse.status);
    
    // Test 2: Check comments API
    console.log('\n📋 Test 2: Comments API');
    const apiResponse = await fetch('http://localhost:3000/api/comments');
    console.log('Comments API status:', apiResponse.status);
    
    if (apiResponse.ok) {
      const comments = await apiResponse.json();
      console.log(`Found ${comments.length} comments in database`);
      
      if (comments.length > 0) {
        console.log('Latest comment:', {
          id: comments[0].id,
          text: comments[0].text.substring(0, 50) + '...',
          userId: comments[0].userId,
          postId: comments[0].postId,
          timestamp: comments[0].timestamp
        });
      }
    }
    
    // Test 3: Check posts API
    console.log('\n📋 Test 3: Posts API');
    const postsResponse = await fetch('http://localhost:3000/api/posts');
    console.log('Posts API status:', postsResponse.status);
    
    if (postsResponse.ok) {
      const posts = await postsResponse.json();
      console.log(`Found ${posts.length} posts in database`);
      
      posts.forEach(post => {
        console.log(`Post ${post.postId.slice(-8)}: ${post.commentCount} comments`);
      });
    }
    
    // Test 4: Simulate comment webhook (manual)
    console.log('\n📋 Test 4: Webhook Simulation');
    console.log('To test webhook:');
    console.log('1. Go to Instagram and comment on your business post');
    console.log('2. Check terminal logs for webhook events');
    console.log('3. Refresh /comments page to see new comment');
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
};

// Run tests
testComments();
