// Test System Users API
async function testSystemUsersAPI() {
  console.log('🧪 Testing System Users API...\n');
  
  try {
    // Test GET /api/system-users
    console.log('1️⃣ Testing GET /api/system-users...');
    const response = await fetch('http://localhost:3000/api/system-users');
    
    if (response.ok) {
      const users = await response.json();
      console.log('✅ GET API works!');
      console.log(`👥 Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ${user.username}: ${user.name} (${user.role})`);
      });
    } else {
      console.log('❌ GET API failed:', response.status);
      const error = await response.text();
      console.log('Error:', error);
    }
    
    // Test POST /api/system-users (create new user)
    console.log('\n2️⃣ Testing POST /api/system-users...');
    const newUserData = {
      username: 'test_user_' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'staff'
    };
    
    const createResponse = await fetch('http://localhost:3000/api/system-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUserData)
    });
    
    if (createResponse.ok) {
      const newUser = await createResponse.json();
      console.log('✅ POST API works!');
      console.log('👤 Created user:', newUser.username);
    } else {
      console.log('❌ POST API failed:', createResponse.status);
      const error = await createResponse.text();
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testSystemUsersAPI();
