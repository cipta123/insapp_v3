const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin1 user...')
    
    const admin = await prisma.systemUser.findUnique({
      where: { username: 'admin1' }
    })
    
    if (admin) {
      console.log('✅ Admin1 found:')
      console.log('   ID:', admin.id)
      console.log('   Username:', admin.username)
      console.log('   Name:', admin.name)
      console.log('   Email:', admin.email)
      console.log('   Role:', admin.role)
      console.log('   Password hash:', admin.password.substring(0, 20) + '...')
      
      // Test current passwords
      const passwords = ['password', 'admin123', 'upbjj@UT22']
      
      for (const pwd of passwords) {
        const isMatch = await bcrypt.compare(pwd, admin.password)
        console.log(`   Test "${pwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`)
      }
      
    } else {
      console.log('❌ Admin1 user not found!')
      
      // Check all users
      const users = await prisma.systemUser.findMany()
      console.log('\n📋 All users in database:')
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
