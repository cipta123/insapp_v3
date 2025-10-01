import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('💬 WHATSAPP_REPLY: Starting reply process...', body)
    
    const { conversationId, replyText, replyToId } = body
    
    if (!conversationId || !replyText) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, replyText' },
        { status: 400 }
      )
    }
    
    // For now, we'll simulate sending via WhatsApp Business API
    // In production, you would integrate with WhatsApp Business API here
    console.log('📤 WHATSAPP_REPLY: Simulating WhatsApp Business API call...')
    console.log('📤 WHATSAPP_REPLY: To:', conversationId)
    console.log('📤 WHATSAPP_REPLY: Message:', replyText)
    
    // Create a unique message ID for our reply
    const replyMessageId = `wa_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Save the reply to our database
    const replyMessage = await prisma.whatsAppMessage.create({
      data: {
        messageId: replyMessageId,
        conversationId: conversationId,
        senderId: process.env.WHATSAPP_BUSINESS_NUMBER || 'business',
        recipientId: conversationId,
        text: replyText,
        messageType: 'text',
        timestamp: new Date(),
        isFromBusiness: true,
        replyToId: replyToId || null
      }
    })
    
    console.log('✅ WHATSAPP_REPLY: Reply saved to database:', replyMessage.id)
    
    // Mark original message as read if replying to specific message
    if (replyToId) {
      await prisma.whatsAppMessage.update({
        where: { id: replyToId },
        data: { isRead: true }
      })
      console.log('📝 WHATSAPP_REPLY: Original message marked as read')
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reply sent successfully',
      replyId: replyMessage.id,
      // In production, you would return the actual WhatsApp API response
      whatsappResponse: {
        status: 'sent',
        messageId: replyMessageId
      }
    })
    
  } catch (error) {
    console.error('❌ WHATSAPP_REPLY: Error sending reply:', error)
    return NextResponse.json(
      { error: 'Failed to send WhatsApp reply' },
      { status: 500 }
    )
  }
}
