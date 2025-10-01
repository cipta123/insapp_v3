// Test auto-fetch functionality
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAutoFetch() {
  const userId = '801101532461905'; // Test user ID
  
  try {
    console.log('🧪 Testing auto-fetch for user:', userId);
    
    // Check if user already exists
    const existingUser = await prisma.instagramUser.findUnique({
      where: { id: userId }
    });
    
    console.log('📋 Existing user data:', existingUser);
    
    // Test Instagram API call
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    console.log('🔑 Access token available:', !!accessToken);
    
    if (accessToken) {
      const response = await fetch(
        `https://graph.instagram.com/v18.0/${userId}?fields=name,username&access_token=${accessToken}`
      );
      
      console.log('📡 Instagram API status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Instagram API response:', userData);
        
        // Test database upsert
        const savedUser = await prisma.instagramUser.upsert({
          where: { id: userId },
          update: {
            name: userData.name || null,
            username: userData.username || null,
            lastFetched: new Date()
          },
          create: {
            id: userId,
            name: userData.name || null,
            username: userData.username || null,
            lastFetched: new Date()
          }
        });
        
        console.log('💾 User saved to database:', savedUser);
      } else {
        const error = await response.text();
        console.log('❌ Instagram API error:', error);
      }
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testAutoFetch();
