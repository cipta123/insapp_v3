import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Updating admin1 password to upbjj@UT22...')
    
    // Hash the new password
    const newPassword = 'upbjj@UT22'
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update admin1 password
    const updatedUser = await prisma.systemUser.update({
      where: {
        username: 'admin1'
      },
      data: {
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log('✅ Password updated successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Admin password updated successfully',
      user: updatedUser,
      newPassword: newPassword
    })
    
  } catch (error) {
    console.error('❌ Error updating password:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
