import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('📱 WHATSAPP_API: Fetching WhatsApp messages...')
    
    const messages = await prisma.whatsAppMessage.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 100 // Limit to last 100 messages
    })
    
    console.log(`✅ WHATSAPP_API: Found ${messages.length} WhatsApp messages`)
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error('❌ WHATSAPP_API: Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📱 WHATSAPP_API: Creating new WhatsApp message:', body)
    
    const { messageId, conversationId, senderId, recipientId, text, messageType, mediaUrl, isFromBusiness } = body
    
    // Check if message already exists
    const existingMessage = await prisma.whatsAppMessage.findUnique({
      where: { messageId }
    })
    
    if (existingMessage) {
      console.log('⚠️ WHATSAPP_API: Message already exists:', messageId)
      return NextResponse.json(existingMessage)
    }
    
    const message = await prisma.whatsAppMessage.create({
      data: {
        messageId,
        conversationId,
        senderId,
        recipientId,
        text: text || null,
        messageType: messageType || 'text',
        mediaUrl: mediaUrl || null,
        timestamp: new Date(),
        isFromBusiness: isFromBusiness || false
      }
    })
    
    console.log('✅ WHATSAPP_API: WhatsApp message created:', message.id)
    
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('❌ WHATSAPP_API: Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create WhatsApp message' },
      { status: 500 }
    )
  }
}
