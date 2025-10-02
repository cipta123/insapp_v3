const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createDemoUsers() {
  try {
    console.log('🔧 Creating demo users...')

    // Demo users data
    const users = [
      {
        username: 'staff1',
        password: 'staff123',
        name: 'Customer Service Staff',
        email: 'staff@company.com',
        role: 'staff'
      },
      {
        username: 'admin1',
        password: 'admin123',
        name: 'System Administrator',
        email: 'admin@company.com',
        role: 'admin'
      },
      {
        username: 'manager1',
        password: 'manager123',
        name: 'Department Manager',
        email: 'manager@company.com',
        role: 'manager'
      },
      {
        username: 'direktur1',
        password: 'direktur123',
        name: 'Executive Director',
        email: 'direktur@company.com',
        role: 'direktur'
      }
    ]

    // Create users
    for (const userData of users) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      // Check if user exists
      const existingUser = await prisma.systemUser.findUnique({
        where: { username: userData.username }
      })

      if (existingUser) {
        console.log(`⚠️  User ${userData.username} already exists, skipping...`)
        continue
      }

      // Create user
      const user = await prisma.systemUser.create({
        data: {
          username: userData.username,
          password: hashedPassword,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: true
        }
      })

      console.log(`✅ Created user: ${user.username} (${user.role})`)
    }

    console.log('\n🎉 Demo users created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('- Staff: staff1 / staff123')
    console.log('- Admin: admin1 / admin123')
    console.log('- Manager: manager1 / manager123')
    console.log('- Direktur: direktur1 / direktur123')

  } catch (error) {
    console.error('❌ Error creating demo users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUsers()
