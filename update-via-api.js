const fetch = require('node-fetch')

async function updateAdminPassword() {
  try {
    console.log('🔐 Updating admin1 password via API...')
    
    // First, get admin1 user ID
    const getUsersResponse = await fetch('http://localhost:3000/api/system-users')
    const users = await getUsersResponse.json()
    
    const admin1 = users.find(user => user.username === 'admin1')
    if (!admin1) {
      console.log('❌ Admin1 user not found')
      return
    }
    
    console.log('👤 Found admin1:', admin1.name, admin1.email)
    
    // Update password
    const updateData = {
      name: admin1.name,
      email: admin1.email,
      role: admin1.role,
      password: 'upbjj@UT22'
    }
    
    const updateResponse = await fetch(`http://localhost:3000/api/system-users/${admin1.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    
    if (updateResponse.ok) {
      const result = await updateResponse.json()
      console.log('✅ Password updated successfully!')
      console.log('🔑 New login credentials:')
      console.log('   Username: admin1')
      console.log('   Password: upbjj@UT22')
    } else {
      const error = await updateResponse.json()
      console.log('❌ Update failed:', error.error)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

updateAdminPassword()
