// Test login API directly
async function testLogin() {
  try {
    console.log('🔐 Testing login API...')
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'direktur1',
        password: 'direktur123'
      })
    })

    const data = await response.json()
    
    console.log('📊 Response Status:', response.status)
    console.log('📊 Response Data:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ Login successful!')
      console.log('👤 User:', data.user.name, `(${data.user.role})`)
      console.log('🎫 Token length:', data.token.length)
    } else {
      console.log('❌ Login failed:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

testLogin()
