import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Demo users for different roles
const demoUsers = [
  {
    id: '1',
    username: 'staff1',
    password: '$2a$10$rOzJqQZQJQZQJQZQJQZQJu', // password: "staff123"
    role: 'staff',
    name: 'John Doe',
    email: 'staff@company.com'
  },
  {
    id: '2',
    username: 'admin1',
    password: '$2a$10$rOzJqQZQJQZQJQZQJQZQJu', // password: "admin123"
    role: 'admin',
    name: 'Jane Smith',
    email: 'admin@company.com'
  },
  {
    id: '3',
    username: 'manager1',
    password: '$2a$10$rOzJqQZQJQZQJQZQJQZQJu', // password: "manager123"
    role: 'manager',
    name: 'Mike Johnson',
    email: 'manager@company.com'
  },
  {
    id: '4',
    username: 'direktur1',
    password: '$2a$10$rOzJqQZQJQZQJQZQJQZQJu', // password: "direktur123"
    role: 'direktur',
    name: 'Sarah Wilson',
    email: 'direktur@company.com'
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, role } = body

    console.log('🔐 LOGIN_ATTEMPT:', { username, role })

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll use simple password validation
    // In production, use proper password hashing
    const validCredentials = {
      staff: { username: 'staff1', password: 'staff123' },
      admin: { username: 'admin1', password: 'admin123' },
      manager: { username: 'manager1', password: 'manager123' },
      direktur: { username: 'direktur1', password: 'direktur123' }
    }

    const roleCredentials = validCredentials[role as keyof typeof validCredentials]
    
    if (!roleCredentials || 
        username !== roleCredentials.username || 
        password !== roleCredentials.password) {
      console.log('❌ LOGIN_FAILED: Invalid credentials')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find user
    const user = demoUsers.find(u => u.username === username && u.role === role)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    console.log('✅ LOGIN_SUCCESS:', { username, role, userId: user.id })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error('❌ LOGIN_ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
