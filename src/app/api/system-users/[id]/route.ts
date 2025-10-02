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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const userData = await request.json()
    
    const userIndex = systemUsers.findIndex(user => user.id === userId)
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Update user data
    const updatedUser = {
      ...systemUsers[userIndex],
      ...userData
    }
    
    // Hash password if provided
    if (userData.password) {
      updatedUser.password = await bcrypt.hash(userData.password, 10)
    }
    
    systemUsers[userIndex] = updatedUser
    
    // Return user without password
    const { password, ...safeUser } = updatedUser
    return NextResponse.json(safeUser)
    
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    
    const userIndex = systemUsers.findIndex(user => user.id === userId)
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Remove user from array
    systemUsers.splice(userIndex, 1)
    
    return NextResponse.json({ message: 'User deleted successfully' })
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
