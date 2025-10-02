const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updatePassword() {
  try {
    console.log('🔐 Starting password update for admin1...')
    
    // First check if user exists
    const existingUser = await prisma.systemUser.findUnique({
      where: { username: 'admin1' }
    })
    
    if (!existingUser) {
      console.log('❌ User admin1 not found!')
      return
    }
    
    console.log('👤 Found user:', existingUser.name)
    
    const newPassword = 'upbjj@UT22'
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    console.log('🔑 Generated hash:', hashedPassword.substring(0, 20) + '...')
    
    const result = await prisma.systemUser.update({
      where: { username: 'admin1' },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Password updated successfully!')
    console.log('Username: admin1')
    console.log('New Password: upbjj@UT22')
    
    // Test the new password
    const testMatch = await bcrypt.compare(newPassword, hashedPassword)
    console.log('🧪 Password verification:', testMatch ? '✅ VALID' : '❌ INVALID')
    
  } catch (error) {
    console.error('❌ Error updating password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePassword()
