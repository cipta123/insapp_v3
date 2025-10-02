import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('📋 API_SYSTEM_USERS: Fetching all users...')
    
    // Fetch users from database without password field
    const users = await prisma.systemUser.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`✅ API_SYSTEM_USERS: Found ${users.length} users`)
    return NextResponse.json(users)
    
  } catch (error) {
    console.error('❌ API_SYSTEM_USERS: Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    console.log('👤 API_SYSTEM_USERS: Creating new user:', userData.username)
    
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
    const existingUser = await prisma.systemUser.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email }
        ]
      }
    })
    
    if (existingUser) {
      console.log('❌ API_SYSTEM_USERS: User already exists')
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // Create new user in database
    const newUser = await prisma.systemUser.create({
      data: {
        username: userData.username,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true
      }
    })
    
    console.log('✅ API_SYSTEM_USERS: User created successfully:', newUser.username)
    return NextResponse.json(newUser, { status: 201 })
    
  } catch (error) {
    console.error('❌ API_SYSTEM_USERS: Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
