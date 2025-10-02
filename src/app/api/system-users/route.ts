import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock database - in production, use real database
let systemUsers = [
  {
    id: '1',
    username: 'staff1',
    name: 'Staff User',
    email: 'staff@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'staff',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    username: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    username: 'manager1',
    name: 'Manager User',
    email: 'manager@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'manager',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-18T09:45:00Z'
  },
  {
    id: '4',
    username: 'direktur1',
    name: 'Direktur User',
    email: 'direktur@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'direktur',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-22T16:20:00Z'
  }
]

export async function GET() {
  try {
    // Return users without password field
    const safeUsers = systemUsers.map(user => {
      const { password, ...safeUser } = user
      return safeUser
    })
    
    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Validate required fields
    const requiredFields = ['username', 'name', 'email', 'password', 'role']
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Check if username or email already exists
    const existingUser = systemUsers.find(
      user => user.username === userData.username || user.email === userData.email
    )
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // Create new user
    const newUser = {
      id: (systemUsers.length + 1).toString(),
      username: userData.username,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }
    
    systemUsers.push(newUser)
    
    // Return user without password
    const { password, ...safeUser } = newUser
    return NextResponse.json(safeUser, { status: 201 })
    
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
