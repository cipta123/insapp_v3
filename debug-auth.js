// Debug authentication issue
async function debugAuth() {
  console.log('🔍 Starting authentication debug...\n');
  
  try {
    // Skip API test, focus on database
    console.log('1️⃣ Skipping API test (use test-login.js for that)...');
    
    if (loginResponse.ok) {
      console.log('✅ Login API works!');
      console.log('👤 User:', loginData.user.name);
      console.log('🎫 Token length:', loginData.token.length);
      console.log('🔑 Token starts with:', loginData.token.substring(0, 20) + '...\n');
      
      // Step 2: Test token validation (if we had a protected endpoint)
      console.log('2️⃣ Testing token structure...');
      const tokenParts = loginData.token.split('.');
      console.log('🔍 Token parts:', tokenParts.length, '(should be 3 for JWT)');
      
      if (tokenParts.length === 3) {
        console.log('✅ Token structure looks correct (JWT format)\n');
        
        // Decode payload (just for debugging - don't do this in production)
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('🔍 Token payload:');
          console.log('   - User ID:', payload.userId);
          console.log('   - Username:', payload.username);
          console.log('   - Role:', payload.role);
          console.log('   - Expires:', new Date(payload.exp * 1000).toLocaleString());
          console.log('   - Issued:', new Date(payload.iat * 1000).toLocaleString());
        } catch (e) {
          console.log('⚠️  Could not decode token payload');
        }
      } else {
        console.log('❌ Token structure incorrect');
      }
      
    } else {
      console.log('❌ Login API failed:', loginData.error);
    }
    
    // Step 3: Test database connection
    console.log('\n3️⃣ Testing database connection...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const userCount = await prisma.systemUser.count();
      console.log('✅ Database connection works!');
      console.log('👥 Total users in database:', userCount);
      
      const testUser = await prisma.systemUser.findUnique({
        where: { username: 'direktur1' }
      });
      
      if (testUser) {
        console.log('✅ Test user found in database');
        console.log('   - Name:', testUser.name);
        console.log('   - Role:', testUser.role);
        console.log('   - Active:', testUser.isActive);
      } else {
        console.log('❌ Test user not found in database');
      }
      
    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.message);
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('- If login API works but browser redirects back, the issue is in AuthProvider');
  console.log('- Check browser console for AuthProvider debug logs');
  console.log('- Test manually at: http://localhost:3000/test-auth');
}

debugAuth();
