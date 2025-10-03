import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// Simple rate limiting to prevent double sends
const recentRequests = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('💬 WATZAP_REPLY: Starting reply process...', body)
    
    const { conversationId, replyText, replyToId } = body
    
    if (!conversationId || !replyText) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, replyText' },
        { status: 400 }
      )
    }

    // Rate limiting: Check if same request was made recently (within 3 seconds)
    const requestKey = `${conversationId}:${replyText}`
    const now = Date.now()
    const lastRequest = recentRequests.get(requestKey)
    
    if (lastRequest && (now - lastRequest) < 3000) {
      console.log('⚠️ WATZAP_REPLY: Duplicate request detected, ignoring')
      return NextResponse.json({ 
        success: true, 
        message: 'Duplicate request ignored',
        replyId: 'duplicate_' + now
      })
    }
    
    // Store this request
    recentRequests.set(requestKey, now)
    
    // Clean up old requests (older than 10 seconds)
    const keysToDelete: string[] = []
    recentRequests.forEach((timestamp, key) => {
      if (now - timestamp > 10000) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => recentRequests.delete(key))
    
    // Send message via Watzap.id API
    console.log('📤 WATZAP_REPLY: Sending via Watzap.id API...')
    console.log('📤 WATZAP_REPLY: To:', conversationId)
    console.log('📤 WATZAP_REPLY: Message:', replyText)
    
    const watzapData = {
      api_key: process.env.WATZAP_API_KEY,
      number_key: process.env.WATZAP_NUMBER_KEY,
      phone_no: conversationId,
      message: replyText
    }
    
    console.log('🔑 WATZAP_REPLY: Using API Key:', process.env.WATZAP_API_KEY)
    console.log('🔑 WATZAP_REPLY: Using Number Key:', process.env.WATZAP_NUMBER_KEY)
    
    const watzapResponse = await axios({
      method: 'post',
      url: 'https://api.watzap.id/v1/send_message',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: watzapData
    })
    
    console.log('✅ WATZAP_REPLY: Watzap.id API response:', watzapResponse.data)
    
    // Create a unique message ID for our reply
    const replyMessageId = `watzap_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Save the reply to our database (with temporary fix)
    let replyMessage;
    try {
      replyMessage = await (prisma as any).whatsAppMessage.create({
        data: {
          messageId: replyMessageId,
          conversationId: conversationId,
          senderId: 'business',
          recipientId: conversationId,
          text: replyText,
          messageType: 'text',
          timestamp: new Date(),
          isFromBusiness: true,
          replyToId: replyToId || null
        }
      })
      
      console.log('✅ WATZAP_REPLY: Reply saved to database:', replyMessage.id)
      
      // Mark original message as read if replying to specific message
      if (replyToId) {
        await (prisma as any).whatsAppMessage.update({
          where: { id: replyToId },
          data: { isRead: true }
        })
        console.log('📝 WATZAP_REPLY: Original message marked as read')
      }
    } catch (modelError) {
      console.log('⚠️ WATZAP_REPLY: WhatsApp model not available yet, skipping database save')
      replyMessage = { id: 'temp_' + Date.now() }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reply sent successfully via Watzap.id',
      replyId: replyMessage.id,
      watzapResponse: watzapResponse.data
    })
    
  } catch (error) {
    console.error('❌ WATZAP_REPLY: Error sending reply:', error)
    
    // Log more details about the error
    if (error.response) {
      console.error('❌ WATZAP_REPLY: API Error Response:', error.response.data)
      console.error('❌ WATZAP_REPLY: API Error Status:', error.response.status)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send WhatsApp reply via Watzap.id',
        details: error.response?.data || error.message
      },
      { status: 500 }
    )
  }
}
