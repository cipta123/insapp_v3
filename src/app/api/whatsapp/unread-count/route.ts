import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('📊 WHATSAPP_UNREAD_COUNT: Getting unread count...')
    
    try {
      // Count unread messages from customers (not from business)
      const unreadCount = await (prisma as any).whatsAppMessage.count({
        where: {
          isRead: false,
          isFromBusiness: false // Only customer messages
        }
      })
      
      console.log('✅ WHATSAPP_UNREAD_COUNT: Found', unreadCount, 'unread messages')
      
      return NextResponse.json({ 
        success: true,
        unreadCount,
        message: `Found ${unreadCount} unread WhatsApp messages`
      })
      
    } catch (modelError) {
      console.log('⚠️ WHATSAPP_UNREAD_COUNT: WhatsApp model not available yet, returning 0')
      return NextResponse.json({ 
        success: true,
        unreadCount: 0,
        message: 'WhatsApp model not ready yet'
      })
    }
    
  } catch (error) {
    console.error('❌ WHATSAPP_UNREAD_COUNT: Error getting unread count:', error)
    return NextResponse.json(
      { error: 'Failed to get WhatsApp unread count' },
      { status: 500 }
    )
  }
}
